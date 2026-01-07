import { useState } from 'react';
import Welcome from './components/Welcome';
import Assessment from './components/Assessment';
import Results from './components/Results';
import VersionFooter from './components/VersionFooter';
import questionsData from './data/questions.json';

function App() {
  const [stage, setStage] = useState('welcome');
  const [userName, setUserName] = useState('');
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const handleStart = (name) => {
    setUserName(name);
    setStage('assessment');
  };

  const handleComplete = (finalAnswers, calculatedResults) => {
    setAnswers(finalAnswers);
    setResults(calculatedResults);
    setStage('results');
  };

  const handleRestart = () => {
    setStage('welcome');
    setUserName('');
    setAnswers({});
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {stage === 'welcome' && <Welcome onStart={handleStart} />}
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
