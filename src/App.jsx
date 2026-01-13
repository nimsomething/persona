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
import { isV2Assessment, isV3Assessment } from './utils/appMeta';
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
    try {
      // Load upgrade questions (IDs 121-140)
      const upgradableQuestions = questionsData.filter(q => q.upgrade_only === true);
      setUpgradeQuestions(upgradableQuestions);
      logger.info('Upgrade questions loaded', { count: upgradableQuestions.length }, 'app');

      const completedAssessments = storageService.getCompletedAssessments();
      
      // Run data migration if needed (for v3.0.0 and earlier data)
      if (completedAssessments.length > 0) {
        // Check if any assessments need migration
        const needsMigration = completedAssessments.some(assessment => 
          dataMigrationService.hasLegacyData(assessment)
        );
        
        if (needsMigration) {
          logger.info('Legacy data detected, starting migration to v3.0.1', {}, 'app');
          
          const { migratedAssessments, migrationStats } = dataMigrationService.migrateAssessmentsToV3_0_1(completedAssessments);
          
          // Save migrated data back to storage
          storageService.saveMigratedAssessments(migratedAssessments, migrationStats);
          
          logger.info('Data migration completed', migrationStats, 'app');
          
          // Continue with the most recent migrated assessment
          if (migrationStats.migrationSuccess > 0 || (migrationStats.skipped > 0 && migratedAssessments.length > 0)) {
            const mostRecent = migratedAssessments[0];
            
            if (mostRecent.version && (isV2Assessment(mostRecent.version) || isV3Assessment(mostRecent.version))) {
              setRecoveredAssessment(mostRecent);
            } else {
              logger.warn('Incompatible assessment version found after migration', { version: mostRecent.version }, 'app');
              setStorageError({
                type: 'version',
                message: 'A previous assessment was found but is from an incompatible version. Please take the assessment again.'
              });
            }
          }
        } else {
          // No migration needed, proceed normally
          const mostRecent = completedAssessments[0];
          logger.info('Completed assessment recovered on mount', {
            userName: mostRecent.userName,
            completedAt: mostRecent.completedAt,
            version: mostRecent.version
          }, 'app');

          if (mostRecent.version && (isV2Assessment(mostRecent.version) || isV3Assessment(mostRecent.version))) {
            setRecoveredAssessment(mostRecent);
          } else {
            logger.warn('Incompatible assessment version found', { version: mostRecent.version }, 'app');
            setStorageError({
              type: 'version',
              message: 'A previous assessment was found but is from an incompatible version. Please take the assessment again.'
            });
          }
        }
      }
    } catch (error) {
      logger.error('Failed to recover completed assessment', { error: error.message }, 'app');
      setStorageError({
        type: 'recovery',
        message: 'Unable to load your previous assessment. Please take the assessment again.'
      });
    }
  }, []);

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
          toVersion: '3.0.1'
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
