import React from 'react';
import DimensionScorecard from '../DimensionScorecard';

const DashboardTab = ({ userName, results, archetype, scores, adaptabilityScore, topStrengths, dimensions }) => {
  const isV3 = !!results.components;

  // Render guard - ensure scores is valid
  if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">Invalid scores data. Please refresh or restart the assessment.</p>
      </div>
    );
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
            <h3 className="font-semibold text-gray-900 mb-3">Adaptability Score:</h3>
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

export default DashboardTab;
