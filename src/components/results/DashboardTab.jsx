import React from 'react';
import DimensionScorecard from '../DimensionScorecard';
import { diagnoseScoresIssues } from '../../utils/scoring';
import logger from '../../services/loggerService';

const DashboardTab = ({ userName, results, archetype, scores, adaptabilityScore, topStrengths, dimensions, scoresDiagnosis }) => {
  const isV3 = !!results.components;

  // Only guard against null/undefined; we still run full diagnosis for detailed errors.
  const computedDiagnosis = diagnoseScoresIssues(scores, isV3);
  const diagnosis = scoresDiagnosis
    ? {
        ...computedDiagnosis,
        ...scoresDiagnosis,
        metadata: { ...computedDiagnosis.metadata, ...scoresDiagnosis.metadata }
      }
    : computedDiagnosis;

  if (scores === undefined || scores === null) {
    logger.warn('DashboardTab received missing scores', { diagnosis }, 'ui');
    return <DashboardErrorDisplay diagnosis={diagnosis} scores={scores} isV3={isV3} />;
  }

  if (!diagnosis.isValid) {
    logger.warn('DashboardTab detected invalid scores', { diagnosis }, 'ui');
    return <DashboardErrorDisplay diagnosis={diagnosis} scores={scores} isV3={isV3} />;
  }

  if (diagnosis.warnings.length > 0) {
    logger.warn('DashboardTab detected warnings in scores', { diagnosis }, 'ui');
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{archetype?.icon || '👤'}</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {archetype?.name || 'Professional'}
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {archetype?.shortDescription}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-6 shadow-sm border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3">About Your Archetype:</h3>
          <p className="text-gray-700 leading-relaxed">
            {archetype?.narrative}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-3">Your Top Strengths:</h3>
            <ul className="space-y-2">
              {topStrengths.map(strength => (
                <li key={strength.key} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1">✓</span>
                  <span className="text-gray-700">
                    <span className="font-medium">{strength.name}</span> ({strength.score}th percentile)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-blue-100">
            <h3 className="font-semibent text-gray-900 mb-3">Adaptability Score:</h3>
            <div className="flex items-center mb-2">
              <div className="text-4xl font-bold text-blue-600">{adaptabilityScore}</div>
              <div className="text-gray-600 ml-2">/100</div>
            </div>
            <p className="text-sm text-gray-600">
              {adaptabilityScore >= 80
                ? 'You maintain consistency under stress—your behavior changes minimally when pressure increases.'
                : adaptabilityScore >= 60
                ? 'You show moderate behavioral changes under stress, which is typical for most professionals.'
                : 'You experience significant behavioral shifts under stress—awareness of these changes can help you manage them.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 px-2">Core Dimension Breakdown</h3>
        <DimensionScorecard scores={scores} dimensions={dimensions} />
      </div>

      <div className="bg-indigo-50 rounded-xl p-8 border border-indigo-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Assessment Summary</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">MBTI Layer</div>
            <div className="text-2xl font-bold text-indigo-600">{results.mbti || 'N/A'}</div>
            <div className="text-xs text-gray-600 mt-1">Cognitive style snapshot</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Primary Color</div>
            <div className="text-2xl font-bold text-indigo-600">{results.birkman_color?.primary || 'N/A'}</div>
            <div className="text-xs text-gray-600 mt-1">Birkman personality type</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Resilience</div>
            <div className="text-2xl font-bold text-indigo-600">{results.resilience?.level || 'N/A'}</div>
            <div className="text-xs text-gray-600 mt-1">Stress management capacity</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced error display component for dashboard tab
 */
const DashboardErrorDisplay = ({ scores, isV3, diagnosis }) => {
  const effectiveDiagnosis = diagnosis || diagnoseScoresIssues(scores, isV3);

  const issues = Array.isArray(effectiveDiagnosis.issues) ? effectiveDiagnosis.issues : [];
  const warnings = Array.isArray(effectiveDiagnosis.warnings) ? effectiveDiagnosis.warnings : [];
  const nextSteps = Array.isArray(effectiveDiagnosis.nextSteps) ? effectiveDiagnosis.nextSteps : [];
  const metadata = effectiveDiagnosis.metadata && typeof effectiveDiagnosis.metadata === 'object' ? effectiveDiagnosis.metadata : {};

  const scoreKeys = scores && typeof scores === 'object' ? Object.keys(scores) : [];

  const defaultNextSteps = [
    'Reload the page to see if saved results rehydrate correctly.',
    'If the problem persists, start a new assessment to generate fresh results.'
  ];

  const stepsToShow = nextSteps.length > 0 ? nextSteps : defaultNextSteps;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="text-3xl">❌</div>
        <div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Validate Assessment Results</h2>
          <p className="text-red-700">We found issues in the saved results data that prevent this dashboard from loading reliably.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* What went wrong */}
        <div className="bg-white border border-red-100 rounded-lg p-6">
          <h3 className="font-bold text-red-900 mb-3">Issues found:</h3>
          <ul className="space-y-2">
            {(issues.length > 0 ? issues : ['Unknown validation failure (no specific issues were reported).']).map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-red-800 text-sm">{issue}</span>
              </li>
            ))}
          </ul>

          {warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-red-100">
              <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
              <ul className="space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-1">⚠</span>
                    <span className="text-yellow-700 text-sm">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Data summary (always visible) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">Data summary:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li><strong>Keys found:</strong> {metadata.keyCount ?? scoreKeys.length}</li>
            {metadata.validCoreDimensions !== undefined && metadata.totalCoreDimensions !== undefined && (
              <li><strong>Core dimensions present:</strong> {metadata.validCoreDimensions}/{metadata.totalCoreDimensions}</li>
            )}
            {Array.isArray(metadata.missingCoreDimensions) && metadata.missingCoreDimensions.length > 0 && (
              <li>
                <strong>Missing core dimensions:</strong> {metadata.missingCoreDimensions.join(', ')}
              </li>
            )}
            {metadata.filteredOutCount > 0 && Array.isArray(metadata.filteredOutKeys) && (
              <li>
                <strong>Filtered out non-primitive keys:</strong>{' '}
                {metadata.filteredOutKeys
                  .slice(0, 8)
                  .map(k => (typeof k === 'string' ? k : `${k.key} (${k.type})`))
                  .join(', ')}
                {metadata.filteredOutKeys.length > 8 ? ` (+${metadata.filteredOutKeys.length - 8} more)` : ''}
              </li>
            )}
          </ul>
        </div>

        {/* Why this happened */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
          <h3 className="font-bold text-indigo-900 mb-3">Likely cause:</h3>
          <p className="text-indigo-800 text-sm">
            {metadata.isLikelyV2
              ? 'This looks like an older (v2) assessment loaded into the v3 app. The data format changed between versions.'
              : 'The saved assessment data may be incomplete, partially corrupted, or from an incompatible app version.'}
          </p>
        </div>

        {/* What to try */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3">What to try next:</h3>
          <ol className="space-y-2">
            {stepsToShow.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="font-bold text-blue-600">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Debug info */}
        {logger.isDebugEnabled() && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-6 overflow-x-auto">
            <h3 className="font-bold mb-3">Debug Info (visible in debug mode)</h3>
            <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({
  hasDiagnosis: !!effectiveDiagnosis,
  scoreKeys: scoreKeys.slice(0, 50),
  scoreCount: scoreKeys.length,
  v3Expected: isV3,
  metadata
}, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Suggestion:</strong> {effectiveDiagnosis.suggestion || 'Restart the assessment to generate complete results.'}
        </p>
      </div>
    </div>
  );
};

export default DashboardTab;
