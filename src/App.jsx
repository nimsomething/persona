import Welcome from './components/Welcome';
import Assessment from './components/Assessment';
import Results from './components/Results';
import VersionFooter from './components/VersionFooter';
import ErrorDisplay from './components/ErrorDisplay';
import { useApp } from './hooks/useApp';
import questionsData from './data/questions.json';
import { canUpgradeAssessment } from './services/versioningService';

function App() {
    const {
        stage,
        userName,
        answers,
        results,
        recoveredAssessment,
        storageError,
        upgradeMode,
        upgradeQuestions,
        errorState,
        actions
    } = useApp();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {stage === 'welcome' && (
                <Welcome
                    onStart={actions.handleStart}
                    onStartUpgrade={actions.handleStartUpgrade}
                    recoveredAssessment={recoveredAssessment}
                    storageError={storageError}
                    onViewRecoveredAssessment={actions.handleViewRecoveredAssessment}
                    canUpgrade={recoveredAssessment && canUpgradeAssessment(recoveredAssessment)}
                />
            )}
            {stage === 'assessment' && (
                <Assessment
                    userName={userName}
                    questions={upgradeMode ? upgradeQuestions : questionsData.filter(q => !q.upgrade_only)}
                    onComplete={actions.handleComplete}
                    isUpgrade={upgradeMode}
                />
            )}
            {stage === 'results' && (
                <Results
                    userName={userName}
                    results={results}
                    answers={answers}
                    questions={questionsData}
                    onRestart={actions.handleRestart}
                />
            )}
            <VersionFooter />
            <ErrorDisplay
                errors={errorState.errors}
                isVisible={errorState.isVisible}
                onToggle={errorState.toggleVisibility}
                onClear={errorState.clearErrors}
                onDismiss={errorState.dismissError}
                onCopyToClipboard={errorState.copyErrorsToClipboard}
            />
        </div>
    );
}

export default App;
