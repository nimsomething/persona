import React from 'react';
import componentsData from '../../data/components.json';
import { isValidComponents } from '../../services/personalityService';
import logger from '../../services/loggerService';

const ComponentsTab = ({ results }) => {
  const components = results.components;

  // Render guard - ensure components is valid
  if (!components || typeof components !== 'object' || Object.keys(components).length === 0) {
    return <ComponentsErrorDisplay missingComponents={true} />;
  }

  // Additional guard - ensure all values are numbers and validate structure
  if (!isValidComponents(components)) {
    const invalidEntries = Object.entries(components).filter(([key, value]) => typeof value !== 'number');
    const expectedKeys = ['social_energy', 'physical_energy', 'emotional_energy', 'self_consciousness', 'assertiveness', 'insistence', 'incentives', 'restlessness', 'thought'];
    const actualKeys = Object.keys(components);
    const missingKeys = expectedKeys.filter(key => !actualKeys.includes(key));
    
    return (
      <ComponentsErrorDisplay 
        missingComponents={false} 
        invalidEntries={invalidEntries}
        missingKeys={missingKeys}
        actualKeys={actualKeys}
      />
    );
  }

  const getComponentData = (key) => {
    return componentsData.find(c => c.id === key) || {
      name: key.replace(/_/g, ' '),
      description: 'Behavioral component description',
      scale_labels: { low: 'Low', high: 'High' }
    };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Understanding the 9 Components</h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          These components represent the fundamental building blocks of your behavioral style. Each scale shows your preference along a spectrum from 0 to 100, where neither end is "better"—they simply indicate different ways of engaging with work and others.
        </p>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        {Object.entries(components).map(([key, value]) => {
          const info = getComponentData(key);
          return (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="max-w-xl">
                  <h4 className="text-xl font-bold text-gray-900 capitalize">
                    {info.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {info.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-blue-600">{value}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Score</div>
                </div>
              </div>

              <div className="relative pt-6 pb-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 px-1">
                  <span className="uppercase">{info.scale_labels.low}</span>
                  <span className="uppercase">{info.scale_labels.high}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full relative">
                  {/* Score Indicator */}
                  <div 
                    className="absolute h-6 w-6 bg-blue-600 border-4 border-white rounded-full shadow-md -top-1.5 -ml-3 transition-all duration-1000 z-10"
                    style={{ left: `${value}%` }}
                  />
                  {/* Progress Bar */}
                  <div 
                    className="absolute h-full bg-blue-100 rounded-full transition-all duration-1000"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 px-1">
                  <div className="w-1/3 text-left">
                    {value < 33 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                        Lower Range
                      </span>
                    )}
                  </div>
                  <div className="w-1/3 text-center">
                    {value >= 33 && value <= 66 && (
                      <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                        Mid Range
                      </span>
                    )}
                  </div>
                  <div className="w-1/3 text-right">
                    {value > 66 && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                        Higher Range
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Component Insights</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Interpreting Mid-Range (33-66)</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Scores in this range suggest behavioral flexibility. You can likely adapt your style to meet the demands of different situations or environments without feeling significant strain.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Interpreting High/Low Ranges</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Scores at the ends of the spectrum represent clearer preferences. These are often your "default" behaviors that feel most natural and energized, but may require more awareness when working with people of opposite styles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced error display component for components tab
 */
const ComponentsErrorDisplay = ({ missingComponents, invalidEntries, missingKeys, actualKeys }) => {
  if (missingComponents) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-xl font-bold text-yellow-900">9-Component Data Unavailable</h3>
        </div>
        <p className="text-yellow-800 mb-4">This assessment version does not include the 9-Component analysis.</p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">What to try:</h4>
          <ol className="space-y-1 text-sm text-blue-800">
            <li>1. If this is a v2 assessment, upgrade to v3.0 to unlock behavioral component analysis</li>
            <li>2. Complete a new assessment to get v3.0 results with all features</li>
          </ol>
        </div>
        <p className="text-sm text-yellow-700 mt-4 italic">
          Expected 9 components but found: {actualKeys ? actualKeys.length : 0} keys.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <span className="text-2xl">❌</span>
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Invalid Component Data</h3>
          <p className="text-red-700">The component data in this assessment is malformed.</p>
        </div>
      </div>

      <div className="space-y-4">
        {(invalidEntries && invalidEntries.length > 0) && (
          <div className="bg-white border border-red-100 rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-2">Invalid entries:</h4>
            <ul className="space-y-1">
              {invalidEntries.map(([key, value], idx) => (
                <li key={idx} className="text-red-800 text-sm">
                  • {key}: {typeof value} (expected: number, got: {typeof value})
                </li>
              ))}
            </ul>
          </div>
        )}

        {(missingKeys && missingKeys.length > 0) && (
          <div className="bg-white border border-yellow-100 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">Missing components:</h4>
            <p className="text-yellow-700 text-sm">Missing these 9 required components:</p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700">
              {missingKeys.map((key, idx) => (
                <li key={idx} className="ml-4">• {key}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">What to try:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Start a new assessment to generate complete v3.0 results</li>
            <li>• If this is a recovered/v2 assessment, return to the Welcome screen and try upgrading</li>
          </ul>
        </div>
      </div>

      {logger.isDebugEnabled() && (
        <div className="mt-4 bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto">
          <h4 className="font-bold mb-2">Debug Info</h4>
          <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({
  actualKeys,
  invalidCount: invalidEntries?.length || 0,
  missingCount: missingKeys?.length || 0,
  totalKeys: actualKeys?.length || 0
}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ComponentsTab;
