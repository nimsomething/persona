import React from 'react';
import DimensionScorecard from '../DimensionScorecard';
import { diagnoseScoresIssues } from '../../utils/scoring';
import logger from '../../services/loggerService';

const DashboardTab = ({ userName, results, archetype, scores, adaptabilityScore, topStrengths, dimensions }) => {
  const isV3 = !!results.components;

  // Render guard - ensure scores is valid
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return <DashboardErrorDisplay scores={scores} isV3={isV3} />;
  }

  // Diagnose and log any issues with scores (even if they don't prevent rendering)
  const diagnosis = diagnoseScoresIssues(scores, isV3);
  if (!diagnosis.isValid || diagnosis.warnings.length > 0) {
    logger.warn('DashboardTab detected issues with scores', diagnosis, 'ui');
  }

  // Use diagnosis to determine if we should show error
  if (diagnosis.issues.length > 0) {
    return <DashboardErrorDisplay diagnosis={diagnosis} scores={scores} isV3={isV3} />;
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
  // Simple case: no scores at all
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Invalid scores data. Please refresh or restart the assessment.</p>
      </div>
    );
  }

  // If we have a diagnosis, show detailed error
  if (diagnosis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-3xl">❌</div>
          <div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Assessment Results</h2>
            <p className="text-red-700">The assessment data contains errors that prevent display.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* What went wrong */}
          <div className="bg-white border border-red-100 rounded-lg p-6">
            <h3 className="font-bold text-red-900 mb-3">What went wrong:</h3>
            <ul className="space-y-2">
              {diagnosis.issues.map((issue, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">•</span>
                  <span className="text-red-800 text-sm">{issue}</span>
                </li>
              ))}
            </ul>

            {diagnosis.warnings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-100">
                <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
                <ul className="space-y-1">
                  {diagnosis.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">⚠</span>
                      <span className="text-yellow-700 text-sm">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Why this happened (if we have metadata) */}
          {diagnosis.metadata && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6">
              <h3 className="font-bold text-indigo-900 mb-3">Why this happened:</h3>
              <p className="text-indigo-800 text-sm">
                {diagnosis.metadata.isLikelyV2 ? (
                  <>
                    This appears to be a v2 assessment (pre-3.0.0) that has been loaded into a v3 context.
                    The data structure has changed between versions.
                  </>
                ) : (
                  'The assessment data has been corrupted, partially lost, or saved from an incompatible version of the application.'
                )}
              </p>
            </div>
          )}

          {/* What to try */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-3">What to try:</h3>
            <ol className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <span className="font-bold text-blue-600">1.</span>
                <span>Try reloading the page to see if the data loads correctly.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <span className="font-bold text-blue-600">2.</span>
                <span>Start a new assessment to generate fresh results.</span>
              </li>
              {diagnosis.metadata?.isLikelyV2 && (
                <li className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Go back to the Welcome screen and use the "Upgrade to v3" option to properly convert your old assessment.</span>
                </li>
              )}
            </ol>
          </div>

          {/* Debug info */}
          {logger.isDebugEnabled() && (
            <div className="bg-gray-900 text-green-400 rounded-lg p-6 overflow-x-auto">
              <h3 className="font-bold mb-3">Debug Info (visible in debug mode)</h3>
              <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({
  hasDiagnosis: true,
  scoresKeys: Object.keys(scores),
  scoresCount: Object.keys(scores).length,
  v3Expected: isV3,
  metadata: diagnosis.metadata
}, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Suggestion:</strong> {diagnosis.suggestion}
          </p>
        </div>
      </div>
    );
  }

  // Fallback for unexpected cases
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p className="text-red-700">Invalid scores data. Please refresh or restart the assessment.</p>
    </div>
  );
};

export default DashboardTab;
