import { useState, useEffect } from 'react';
import questionsData from '../data/questions.json';
import storageService from '../services/storageService';
import { migrateAssessments, canUpgradeAssessment, upgradeV2toV3 } from '../services/versioningService';
import logger from '../services/loggerService';
import { APP_VERSION } from '../services/appService';
import { useErrorLog } from './useErrorLog';

export const useApp = () => {
    const [stage, setStage] = useState('welcome');
    const [userName, setUserName] = useState('');
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [recoveredAssessment, setRecoveredAssessment] = useState(null);
    const [storageError, setStorageError] = useState(null);
    const [upgradeMode, setUpgradeMode] = useState(false);
    const [upgradeQuestions, setUpgradeQuestions] = useState([]);

    const { errors, isVisible: isErrorPanelVisible, addError, clearErrors, toggleVisibility: toggleErrorPanel, dismissError, copyErrorsToClipboard } = useErrorLog();

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

    useEffect(() => {
        let isMounted = true;
        const initialize = async () => {
            if (!isMounted) return;
            try {
                const upgradableQuestions = questionsData.filter(q => q.upgrade_only === true);
                setUpgradeQuestions(upgradableQuestions);

                const diagnosticSummary = storageService.diagnosticRawAnswersOnLoad();
                let assessmentsToPersist = [];
                if (diagnosticSummary.totalAssessments > 0) {
                    const { migratedAssessments, migrationStats } = migrateAssessments(diagnosticSummary.results.map(r => r.assessment));
                    assessmentsToPersist = migratedAssessments;
                    if (migrationStats.migrated > 0) {
                        storageService.saveMigratedAssessments(migratedAssessments, migrationStats);
                    }
                    if (assessmentsToPersist.length > 0) {
                        setRecoveredAssessment(assessmentsToPersist[0]);
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
        return () => { isMounted = false; };
    }, [addError, toggleErrorPanel]);

    const handleStart = (name) => {
        setUserName(name);
        setUpgradeMode(false);
        setStage('assessment');
    };

    const handleStartUpgrade = () => {
        if (recoveredAssessment && canUpgradeAssessment(recoveredAssessment)) {
            setUserName(recoveredAssessment.userName);
            setUpgradeMode(true);
            setStage('assessment');
        }
    };

    const handleComplete = (finalAnswers, calculatedResults, isUpgrade = false) => {
        setAnswers(finalAnswers);
        if (isUpgrade && recoveredAssessment) {
            try {
                const blendedResults = upgradeV2toV3(recoveredAssessment, finalAnswers, upgradeQuestions);
                setResults(blendedResults);
                storageService.upgradeAssessmentFromV2(recoveredAssessment, finalAnswers, blendedResults);
            } catch (error) {
                setStorageError({
                    type: 'upgrade',
                    message: 'Failed to upgrade your assessment. Please try again or start a new assessment.'
                });
                return;
            }
        } else {
            setResults(calculatedResults);
        }
        setStage('results');
        setRecoveredAssessment(null);
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
    };

    const handleViewRecoveredAssessment = () => {
        if (recoveredAssessment) {
            setUserName(recoveredAssessment.userName);
            setResults(recoveredAssessment.results);
            setAnswers({});
            setStage('results');
            setRecoveredAssessment(null);
            setStorageError(null);
        }
    };

    return {
        stage,
        userName,
        answers,
        results,
        recoveredAssessment,
        storageError,
        upgradeMode,
        upgradeQuestions,
        errorState: {
            errors,
            isVisible: isErrorPanelVisible,
            addError,
            clearErrors,
            toggleVisibility: toggleErrorPanel,
            dismissError,
            copyErrorsToClipboard
        },
        actions: {
            handleStart,
            handleStartUpgrade,
            handleComplete,
            handleRestart,
            handleViewRecoveredAssessment
        }
    };
};
