import { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import Assessment from './components/Assessment';
import Results from './components/Results';
import VersionFooter from './components/VersionFooter';
import ErrorDisplay from './components/ErrorDisplay';
import questionsData from './data/questions.json';
import storageService from './services/storageService';
import upgradeService from './services/upgradeService';
import dataMigrationService from './services/dataMigrationService';
import logger from './services/loggerService';
import { APP_VERSION, isV2Assessment, isV3Assessment } from './utils/appMeta';
import { useErrorLog } from './hooks/useErrorLog';

function App() {
  const [stage, setStage] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [recoveredAssessment, setRecoveredAssessment] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [upgradeQuestions, setUpgradeQuestions] = useState([]);

  // Error logging hook
  const {
    errors,
    isVisible: isErrorPanelVisible,
    addError,
    clearErrors,
    toggleVisibility: toggleErrorPanel,
    dismissError,
    copyErrorsToClipboard
  } = useErrorLog();

  // Keyboard shortcut for toggling error panel (Shift+E)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === 'E') {
        event.preventDefault();
        toggleErrorPanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleErrorPanel]);

  // Recover completed assessments on mount and load upgrade questions
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!isMounted) return;

      try {
        // Load upgrade questions
        const upgradableQuestions = questionsData.filter(q => q.upgrade_only === true);
        setUpgradeQuestions(upgradableQuestions);
        logger.info('Upgrade questions loaded', { count: upgradableQuestions.length }, 'app');

        // Run diagnostics and recovery
        const diagnosticSummary = storageService.diagnosticRawAnswersOnLoad();
        let assessmentsToPersist = [];
        let recoveredCount = 0;
        let unrecoverableCount = 0;

        if (diagnosticSummary.totalAssessments > 0) {
          const updatedAssessments = diagnosticSummary.results.map(result => {
            if (result.isRecoverable) {
              const rawAnswers = storageService.getRawAnswersFromAssessment(result.assessment);
              const isV3 = storageService.isAssessmentExpectedV3(result.assessment);
              const recalculatedResults = storageService.recalculateResultsFromAnswers(rawAnswers, isV3);

              if (recalculatedResults) {
                recoveredCount++;
                return storageService.applyRecoveredResultsToAssessment(
                  result.assessment,
                  recalculatedResults,
                  { method: 'recalculatedFromAnswers', recoveredByVersion: APP_VERSION },
                  isV3
                );
              }
            }
            // Mark as unrecoverable
            unrecoverableCount++;
            return {
              ...result.assessment,
              recoveryAttempted: true,
              rawAnswersNotFound: !result.rawAnswersFound,
            };
          });

          storageService.persistCompletedAssessments(updatedAssessments, {
            operation: 'diagnosticRecovery',
            recovered: recoveredCount,
            unrecoverable: unrecoverableCount,
          });
          assessmentsToPersist = updatedAssessments;

          // Log and display summary
          const summaryMessage = `Recovery complete. Total: ${diagnosticSummary.totalAssessments}, Recovered: ${recoveredCount}, Unrecoverable: ${unrecoverableCount}`;
          logger.info(summaryMessage, diagnosticSummary, 'recovery');
          addError({
            id: 'recovery-summary',
            message: summaryMessage,
            category: 'recovery',
            level: 'INFO',
          });
          toggleErrorPanel(); // Open the panel to show the summary
        }

        // After recovery, check for data migration needs
        if (assessmentsToPersist.length > 0) {
          const needsMigration = assessmentsToPersist.some(assessment => dataMigrationService.hasLegacyData(assessment));
          if (needsMigration) {
            logger.info('Legacy data detected, starting migration', { targetVersion: APP_VERSION }, 'app');
            const { migratedAssessments, migrationStats } = dataMigrationService.migrateAssessmentsToV3_0_1(assessmentsToPersist);
            storageService.saveMigratedAssessments(migratedAssessments, migrationStats);
            logger.info('Data migration completed', migrationStats, 'app');
            if (migratedAssessments.length > 0) {
              setRecoveredAssessment(migratedAssessments[0]);
            }
          } else {
            const mostRecent = assessmentsToPersist[0];
            setRecoveredAssessment(mostRecent);
          }
        }

      } catch (error) {
        logger.error('Failed during app initialization', { error: error.message, stack: error.stack }, 'app');
        if (isMounted) {
          setStorageError({
            type: 'initialization',
            message: 'An error occurred while initializing the application. Please try again.',
          });
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [addError, toggleErrorPanel]);

  const handleStart = (name) => {
    setUserName(name);
    setUpgradeMode(false);
    setStage('assessment');
    logger.info('Assessment started', { userName: name }, 'app');
  };

  const handleStartUpgrade = () => {
    if (recoveredAssessment && upgradeService.canUpgradeAssessment(recoveredAssessment)) {
      setUserName(recoveredAssessment.userName);
      setUpgradeMode(true);
      setStage('assessment');
      logger.info('Upgrade assessment started', { 
        userName: recoveredAssessment.userName,
        fromVersion: recoveredAssessment.version 
      }, 'app');
    }
  };

  const handleComplete = (finalAnswers, calculatedResults, isUpgrade = false) => {
    setAnswers(finalAnswers);
    
    if (isUpgrade && recoveredAssessment) {
      // This is an upgraded assessment - blend with v2 data
      try {
        const blendedResults = upgradeService.upgradeV2toV3(
          recoveredAssessment,
          finalAnswers,
          upgradeQuestions
        );
        setResults(blendedResults);
        
        // Save the upgraded assessment
        storageService.upgradeAssessmentFromV2(recoveredAssessment, finalAnswers, blendedResults);
        
        logger.info('Upgrade completed successfully', {
          userName: recoveredAssessment.userName,
          fromVersion: recoveredAssessment.version,
          toVersion: APP_VERSION
        }, 'app');
      } catch (error) {
        logger.error('Failed to complete upgrade', { error: error.message }, 'app');
        setStorageError({
          type: 'upgrade',
          message: 'Failed to upgrade your assessment. Please try again or start a new assessment.'
        });
        return;
      }
    } else {
      // Normal assessment
      setResults(calculatedResults);
    }
    
    setStage('results');
    setRecoveredAssessment(null); // Clear recovered assessment
    setStorageError(null);
    setUpgradeMode(false);
  };

  const handleRestart = () => {
    setStage('welcome');
    setUserName('');
    setAnswers({});
    setResults(null);
    setRecoveredAssessment(null);
    setStorageError(null);
    logger.info('Assessment restarted', {}, 'app');
  };

  const handleViewRecoveredAssessment = () => {
    if (recoveredAssessment) {
      setUserName(recoveredAssessment.userName);
      setResults(recoveredAssessment.results);
      setAnswers({}); // Answers are not stored in completed assessment
      setStage('results');
      setRecoveredAssessment(null);
      setStorageError(null);
      logger.info('Viewing recovered assessment', {
        userName: recoveredAssessment.userName,
        completedAt: recoveredAssessment.completedAt
      }, 'app');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {stage === 'welcome' && (
        <Welcome
          onStart={handleStart}
          onStartUpgrade={handleStartUpgrade}
          recoveredAssessment={recoveredAssessment}
          storageError={storageError}
          onViewRecoveredAssessment={handleViewRecoveredAssessment}
          canUpgrade={recoveredAssessment && upgradeService.canUpgradeAssessment(recoveredAssessment)}
        />
      )}
      {stage === 'assessment' && (
        <Assessment
          userName={userName}
          questions={upgradeMode ? upgradeQuestions : questionsData.filter(q => !q.upgrade_only)}
          onComplete={handleComplete}
          isUpgrade={upgradeMode}
        />
      )}
      {stage === 'results' && (
        <Results
          userName={userName}
          results={results}
          answers={answers}
          questions={questionsData}
          onRestart={handleRestart}
        />
      )}
      <VersionFooter />
      
      {/* Error Display Panel */}
      <ErrorDisplay
        errors={errors}
        isVisible={isErrorPanelVisible}
        onToggle={toggleErrorPanel}
        onClear={clearErrors}
        onDismiss={dismissError}
        onCopyToClipboard={copyErrorsToClipboard}
      />
    </div>
  );
}

export default App;
