import { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import Question from './Question';
import { calculateDimensionScores, determineArchetype, calculateStressDeltas, calculateAdaptabilityScore } from '../utils/scoring';
import storageService from '../services/storageService';
import logger from '../services/loggerService';

function Assessment({ userName, questions, onComplete, isUpgrade = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());
  const [sessionRecovered, setSessionRecovered] = useState(false);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentPage = Math.floor(currentIndex / questionsPerPage);
  const pageQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);
  
  const progress = (Object.keys(answers).length / questions.length) * 100;
  // Upgrade questions are faster (0.75 min per question), regular is 0.25 min
  const timePerQuestion = isUpgrade ? 0.75 : 0.25;
  const estimatedTimeRemaining = Math.max(0, Math.ceil((questions.length - Object.keys(answers).length) * timePerQuestion));

  // Auto-recover existing session on mount
  useEffect(() => {
    const existingSession = storageService.shouldResumeSession();
    if (existingSession && !sessionRecovered) {
      // Auto-resume the session without user prompt
      setAnswers(existingSession.responses || {});
      setCurrentIndex(existingSession.currentQuestion || 0);
      setSessionRecovered(true);
      logger.logAssessmentEvent('session recovered', userName, {
        questionIndex: existingSession.currentQuestion,
        answersCount: Object.keys(existingSession.responses || {}).length
      });
    }
  }, [sessionRecovered, userName]);

  // Auto-save effect - save every 3 questions answered
  useEffect(() => {
    const answeredCount = Object.keys(answers).length;

    // Save if we've answered 3 more questions since last save
    if (answeredCount > 0 && answeredCount % 3 === 0) {
      storageService.autoSave(userName, currentIndex, answers);
      logger.logAssessmentEvent('auto-save triggered', userName, {
        questionIndex: currentIndex,
        answersCount: answeredCount
      });
    }
  }, [answers, currentIndex, userName]);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: value };
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentIndex((currentPage + 1) * questionsPerPage);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentIndex((currentPage - 1) * questionsPerPage);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    if (isUpgrade) {
      // For upgrade mode, just pass the answers - parent will handle blending
      logger.logAssessmentEvent('upgrade completed', userName, {
        answersCount: Object.keys(answers).length,
        completionTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`
      });
      onComplete(answers, null, true); // true indicates this is an upgrade
    } else {
      // Normal assessment - calculate scores
      const scores = calculateDimensionScores(answers, questions);
      const archetype = determineArchetype(scores);
      const stressDeltas = calculateStressDeltas(scores);
      const adaptabilityScore = calculateAdaptabilityScore(stressDeltas);

      const results = {
        dimensions: scores,
        archetype,
        mbtiType: scores.mbtiType,
        values_profile: scores.values_profile,
        work_style_profile: scores.work_style_profile,
        components: scores.components,
        birkman_color: scores.birkman_color,
        birkman_states: scores.birkman_states,
        stressDeltas,
        adaptabilityScore,
        completionTime: Date.now() - startTime
      };

      logger.logAssessmentEvent('completed', userName, {
        archetype: archetype.name,
        adaptabilityScore,
        completionTime: `${(results.completionTime / 1000).toFixed(2)}s`,
        answersCount: Object.keys(answers).length
      });

      onComplete(answers, results, false);
    }
  };

  const allQuestionsAnswered = questions.every(q => answers[q.id] !== undefined);
  const currentPageAnswered = pageQuestions.every(q => answers[q.id] !== undefined);
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isUpgrade ? `Upgrading ${userName}'s Assessment to v3` : `${userName}'s Assessment`}
            </h2>
            <p className="text-gray-600">
              {isUpgrade ? 'Answer 20 questions to unlock v3 features' : `Page ${currentPage + 1} of ${totalPages}`}
            </p>
          </div>

          <ProgressBar progress={progress} />
          
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <span>{Object.keys(answers).length} of {questions.length} answered</span>
            <span>≈ {estimatedTimeRemaining} min remaining</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="space-y-8">
            {pageQuestions.map((question, idx) => (
              <Question
                key={question.id}
                question={question}
                number={currentPage * questionsPerPage + idx + 1}
                value={answers[question.id]}
                onChange={(value) => handleAnswer(question.id, value)}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                currentPage === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>

            {isLastPage ? (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  allQuestionsAnswered
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Complete Assessment
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!currentPageAnswered}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  currentPageAnswered
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            )}
          </div>

          {!allQuestionsAnswered && isLastPage && (
            <p className="text-center text-sm text-red-600 mt-4">
              Please answer all questions to complete the assessment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assessment;
