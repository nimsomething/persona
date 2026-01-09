import { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import Assessment from './components/Assessment';
import Results from './components/Results';
import VersionFooter from './components/VersionFooter';
import questionsData from './data/questions.json';
import storageService from './services/storageService';
import logger from './services/loggerService';

function App() {
  const [stage, setStage] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [recoveredAssessment, setRecoveredAssessment] = useState(null);
  const [storageError, setStorageError] = useState(null);

  // Recover completed assessments on mount
  useEffect(() => {
    try {
      const completedAssessments = storageService.getCompletedAssessments();
      if (completedAssessments.length > 0) {
        const mostRecent = completedAssessments[0];
        logger.info('Completed assessment recovered on mount', {
          userName: mostRecent.userName,
          completedAt: mostRecent.completedAt,
          version: mostRecent.version
        }, 'app');

        // Check if the version is compatible
        if (mostRecent.version && mostRecent.version.startsWith('2.')) {
          setRecoveredAssessment(mostRecent);
        } else {
          logger.warn('Incompatible assessment version found', { version: mostRecent.version }, 'app');
          setStorageError({
            type: 'version',
            message: 'A previous assessment was found but is from an incompatible version. Please take the assessment again.'
          });
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
    setStage('assessment');
    logger.info('Assessment started', { userName: name }, 'app');
  };

  const handleComplete = (finalAnswers, calculatedResults) => {
    setAnswers(finalAnswers);
    setResults(calculatedResults);
    setStage('results');
    setRecoveredAssessment(null); // Clear recovered assessment when starting new one
    setStorageError(null);
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
          recoveredAssessment={recoveredAssessment}
          storageError={storageError}
          onViewRecoveredAssessment={handleViewRecoveredAssessment}
        />
      )}
      {stage === 'assessment' && (
        <Assessment
          userName={userName}
          questions={questionsData}
          onComplete={handleComplete}
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
    </div>
  );
}

export default App;
