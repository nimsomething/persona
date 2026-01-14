import { useState, useEffect } from 'react';
import DimensionScorecard from './DimensionScorecard';
import { generatePDF } from '../services/pdfService';
import {
  calculateOverallResilience,
  generateCBPersonalizedNarrative,
  isValidScores,
  isValidComponents,
  isValidBirkmanColor,
  isValidBirkmanStates,
  diagnoseScoresIssues
} from '../services/personalityService';
import { APP_VERSION } from '../services/appService';
import storageService from '../services/storageService';
import logger from '../services/loggerService';

// v3 Tab Components
import DashboardTab from './results/DashboardTab';
import BirkmanColorsTab from './results/BirkmanColorsTab';
import ComponentsTab from './results/ComponentsTab';
import InternalStatesTab from './results/InternalStatesTab';
import CareersTab from './results/CareersTab';
import DownloadTab from './results/DownloadTab';

function Results({ userName, results, answers, questions, onRestart }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Handle missing results gracefully
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the assessment results. Please try taking the assessment again.</p>
          <button onClick={onRestart} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
            Return to Welcome
          </button>
        </div>
      </div>
    );
  }

  // Handle both v2 and v3 result structures
  const scores = results.dimensions || results.scores || {};

  // Common result fields (v2 + v3)
  const archetype = results.archetype || {
    name: 'Professional',
    icon: '👤',
    shortDescription: 'Strategic professional',
    narrative: 'You are a balanced professional.'
  };
  const stressDeltas = results.stressDeltas || {};
  const adaptabilityScore = results.adaptabilityScore || 50;

  // v3-only fields
  const birkmanColor = results.birkman_color;
  const components = results.components;
  const birkmanStates = results.birkman_states;
  const isV3 = !!components;

  // Validate scores - filter out any non-primitive values that could cause rendering errors
  const validatedScores = {};
  Object.entries(scores).forEach(([key, value]) => {
    // Only include primitive values (numbers, strings, booleans)
    // Skip objects like values_profile, work_style_profile that are in the results object
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      validatedScores[key] = value;
    }
  });

  const filteredOutKeys = Object.entries(scores)
    .filter(([, value]) => typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean')
    .map(([key, value]) => ({
      key,
      type: Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value
    }));

  const scoresDiagnosisBase = diagnoseScoresIssues(validatedScores, isV3);
  const scoresDiagnosis = filteredOutKeys.length > 0
    ? {
        ...scoresDiagnosisBase,
        metadata: {
          ...scoresDiagnosisBase.metadata,
          filteredOutKeys,
          filteredOutCount: filteredOutKeys.length
        }
      }
    : scoresDiagnosisBase;

  // Debug logging for recovered assessments when debug mode is enabled
  useEffect(() => {
    if (logger.isDebugEnabled() && results && (results.recovered || results.previouslySaved)) {
      logger.debug('results', '=== RECOVERED ASSESSMENT LOADED ===', {
        isV3: isV3,
        scoreKeys: Object.keys(scores),
        scoreCount: Object.keys(scores).length,
        resultsKeys: Object.keys(results),
        hasComponents: !!results.components,
        hasBirkmanColor: !!results.birkman_color,
        hasStates: !!results.birkman_states,
        versionMeta: {
          detectedV3: !!results.components,
          hasV2Values: !!scores.values_autonomy,
          hasWorkStyle: !!scores.work_pace
        }
      });
    }
  }, [results, scores, isV3]);

  // Data validation - capture diagnostics and persist validation failures
  const primitiveScoresValid = isValidScores(validatedScores);

  if (!primitiveScoresValid || !scoresDiagnosis.isValid) {
    logger.logValidationError('results', 'scores', scoresDiagnosis, {
      userName,
      isV3,
      primitiveScoresValid,
      rawScoreKeyCount: scores && typeof scores === 'object' ? Object.keys(scores).length : 0,
      validatedScoreKeyCount: Object.keys(validatedScores).length
    });
  } else if (scoresDiagnosis.warnings.length > 0) {
    logger.warn('Scores validation warnings detected', { diagnosis: scoresDiagnosis }, 'results');
  }

  if (components && !isValidComponents(components)) {
    logger.logValidationError('results', 'components', {
      isValid: false,
      issues: ['components object is missing required keys or contains non-numeric values'],
      warnings: [],
      suggestion: 'Some v3 features may not display correctly. Consider starting a new assessment.',
      metadata: { componentKeys: Object.keys(components || {}) }
    }, { userName, isV3 });
  }

  if (birkmanColor && !isValidBirkmanColor(birkmanColor)) {
    logger.logValidationError('results', 'birkman_color', {
      isValid: false,
      issues: ['birkman_color is missing required fields or contains invalid values'],
      warnings: [],
      suggestion: 'Color results may not display correctly. Consider starting a new assessment.',
      metadata: { birkmanColor }
    }, { userName, isV3 });
  }

  if (birkmanStates && !isValidBirkmanStates(birkmanStates)) {
    logger.logValidationError('results', 'birkman_states', {
      isValid: false,
      issues: ['birkman_states is missing required fields or contains invalid values'],
      warnings: [],
      suggestion: 'Internal states may not display correctly. Consider starting a new assessment.',
      metadata: { stateKeys: Object.keys(birkmanStates || {}) }
    }, { userName, isV3 });
  }

  // Save completed assessment to localStorage on mount
  useEffect(() => {
    if (results && userName) {
      try {
        const saved = storageService.saveCompletedAssessment(userName, results);
        if (!saved) {
          logger.warn('Failed to save completed assessment on mount', { userName }, 'results');
          setError({
            type: 'storage',
            message: 'Your results may not be saved if you refresh the page. Please download the PDF report.'
          });
        }
      } catch (err) {
        logger.error('Error saving assessment', { error: err.message });
      }
    }
  }, [results, userName]);

  const dimensions = [
    { key: 'assertiveness', name: 'Assertiveness' },
    { key: 'sociability', name: 'Sociability' },
    { key: 'conscientiousness', name: 'Conscientiousness' },
    { key: 'flexibility', name: 'Flexibility' },
    { key: 'emotional_intelligence', name: 'Emotional Intelligence' },
    { key: 'creativity', name: 'Creativity' },
    { key: 'risk_appetite', name: 'Risk Appetite' },
    { key: 'theoretical_orientation', name: 'Theoretical vs Practical' }
  ];

  const mbti = results.mbti || {};
  const resilience = calculateOverallResilience(stressDeltas);
  const personalizedNarrative = generateCBPersonalizedNarrative(archetype, scores, mbti);

  const handleGeneratePDF = async () => {
    setError(null);
    setGenerating(true);
    logger.logPDFGeneration('started', userName);

    try {
      // Create a combined results object with all calculated metrics
      const fullResults = {
        ...results,
        mbti,
        resilience,
        personalizedNarrative
      };

      await logger.measureAsyncOperation(
        'PDF generation',
        () => generatePDF(userName, fullResults),
        'pdf'
      );

      logger.logPDFGeneration('completed', userName, {
        archetype: archetype.name,
        dimensionsCount: dimensions.length
      });
    } catch (error) {
      logger.logPDFGeneration('failed', userName, {
        error: error.message,
        stack: error.stack,
        archetype: archetype.name
      });

      setError({
        type: 'pdf',
        message: `Unable to generate PDF: ${error.message || 'An unexpected error occurred'}`,
        details: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  const topStrengths = dimensions
    .map(dim => ({
      ...dim,
      score: validatedScores[`${dim.key}_usual`] || 50
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'colors', label: 'Birkman Colors', icon: '🎨' },
    { id: 'components', label: '9 Components', icon: '🧩' },
    { id: 'states', label: 'Internal States', icon: '🔋' },
    { id: 'careers', label: 'Career Guidance', icon: '🚀' },
    { id: 'download', label: 'Download PDF', icon: '📄' }
  ];

  const renderActiveTab = () => {
    const tabProps = {
      userName,
      results: { ...results, mbti, resilience, personalizedNarrative },
      archetype,
      scores: validatedScores,
      scoresDiagnosis,
      adaptabilityScore,
      topStrengths,
      dimensions,
      generating,
      onGeneratePDF: handleGeneratePDF,
      isV3
    };

    switch (activeTab) {
      case 'dashboard': return <DashboardTab {...tabProps} />;
      case 'colors': return <BirkmanColorsTab {...tabProps} />;
      case 'components': return <ComponentsTab {...tabProps} />;
      case 'states': return <InternalStatesTab {...tabProps} />;
      case 'careers': return <CareersTab {...tabProps} />;
      case 'download': return <DownloadTab {...tabProps} />;
      default: return <DashboardTab {...tabProps} />;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {userName}'s <span className="text-blue-600">Results</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              V3.0 Assessment • {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="px-6 py-2 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition shadow-sm"
            >
              Restart
            </button>
            <button
              onClick={() => setActiveTab('download')}
              className="px-6 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md"
            >
              Get Report
            </button>
          </div>
        </div>

        {error && (
          <div className={`rounded-2xl p-4 mb-8 ${
            error.type === 'storage' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <span className="text-2xl mr-3">
                {error.type === 'storage' ? '⚠️' : '❌'}
              </span>
              <div>
                <h3 className={`font-bold mb-1 ${
                  error.type === 'storage' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {error.type === 'storage' ? 'Storage Warning' : 'Error'}
                </h3>
                <p className={`text-sm font-medium ${
                  error.type === 'storage' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-20">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[600px]">
          {renderActiveTab()}
        </div>

        {/* Version Info Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
          Birkman-Style Personality Assessment V{APP_VERSION} • Built for cto.new • Comprehensive Professional Report
        </div>
      </div>
    </div>
  );
}

export default Results;
