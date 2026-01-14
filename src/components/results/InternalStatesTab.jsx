import React from 'react';
import { isValidBirkmanStates } from '../../services/personalityService';
import logger from '../../services/loggerService';

const InternalStatesTab = ({ results }) => {
  const states = results.birkman_states;

  // Render guard - ensure birkman_states is valid
  if (!states || typeof states !== 'object' || !states.interests || !states.usual_behavior || !states.needs || !states.stress_behavior) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl">⚠️</span>
          <h3 className="text-xl font-bold text-yellow-900">Internal States Data Unavailable</h3>
        </div>
        <p className="text-yellow-800 mb-4">This assessment version does not include detailed Interests, Needs, and Stress behavior analysis.</p>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">What to try:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Complete a v3.0 assessment to unlock detailed state analysis</li>
            <li>• Upgrade from v2 if you have a previous assessment saved</li>
          </ul>
        </div>
      </div>
    );
  }

  // Additional validation using the scoring utility
  if (!isValidBirkmanStates(states)) {
    const expectedStates = ['interests', 'usual_behavior', 'needs', 'stress_behavior'];
    const actualStates = Object.keys(states);
    const missingStates = expectedStates.filter(key => !actualStates.includes(key));
    
    const invalidStates = actualStates.filter(state => {
      if (!states[state] || typeof states[state] !== 'object') return true;
      const colors = ['Red', 'Green', 'Yellow', 'Blue'];
      return colors.some(color => {
        const value = states[state]?.[color];
        return typeof value !== 'number' || value < 0 || value > 100;
      });
    });

    return (
      <InternalStatesErrorDisplay 
        missingStates={missingStates}
        invalidStates={invalidStates}
        actualStates={actualStates}
      />
    );
  }

  const stateDefinitions = {
    interests: {
      name: 'Interests',
      description: 'What you enjoy and what captures your attention.',
      icon: '⭐'
    },
    usual_behavior: {
      name: 'Usual Behavior',
      description: 'Your typical, effective style of interacting with others.',
      icon: '😊'
    },
    needs: {
      name: 'Needs',
      description: 'The support and environment you require to be effective.',
      icon: '🔋'
    },
    stress_behavior: {
      name: 'Stress Behavior',
      description: 'How your behavior changes when your needs are not met.',
      icon: '⚠️'
    }
  };

  const getColorHex = (colorName) => {
    switch (colorName) {
      case 'Red': return '#EF4444';
      case 'Green': return '#10B981';
      case 'Yellow': return '#F59E0B';
      case 'Blue': return '#3B82F6';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-2">Your Behavioral Internal States</h3>
        <p className="text-sm text-indigo-800 leading-relaxed">
          This section explores the relationship between what you enjoy (Interests), how you behave (Usual), what you require (Needs), and how you react under pressure (Stress). Understanding these layers is key to managing your energy and relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(states).map(([stateKey, spectrum]) => {
          const def = stateDefinitions[stateKey];
          return (
            <div key={stateKey} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{def.icon}</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{def.name}</h4>
                  <p className="text-sm text-gray-600">{def.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-8 w-full flex rounded-full overflow-hidden shadow-inner border border-gray-100">
                  {Object.entries(spectrum).map(([color, percent]) => (
                    <div 
                      key={color}
                      className="h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: getColorHex(color),
                        opacity: percent > 0 ? 1 : 0
                      }}
                    >
                      {percent > 10 ? `${percent}%` : ''}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(spectrum).map(([color, percent]) => (
                    <div key={color} className="text-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">{color}</div>
                      <div className="text-sm font-black" style={{ color: getColorHex(color) }}>{percent}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">The Needs-Stress Link</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-right">
            <div className="inline-block p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
              <span className="text-4xl">🔋</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">When Needs are Met</h4>
            <p className="text-sm text-gray-600">
              You operate in your <strong>Usual Behavior</strong>, which is your most productive and positive social style.
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-block p-4 bg-red-50 rounded-2xl border border-red-100 mb-4">
              <span className="text-4xl">⚠️</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">When Needs are Unmet</h4>
            <p className="text-sm text-gray-600">
              You shift into <strong>Stress Behavior</strong>, which is a less effective way of trying to get your needs satisfied.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500 italic">
            Self-awareness of this cycle allows you to communicate your needs clearly and avoid stress triggers.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced error display component for internal states tab
 */
const InternalStatesErrorDisplay = ({ missingStates, invalidStates, actualStates }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-8">
      <div className="flex items-start gap-4 mb-6">
        <span className="text-2xl">❌</span>
        <div>
          <h3 className="text-xl font-bold text-red-900 mb-2">Invalid Internal States Data</h3>
          <p className="text-red-700">The internal states data in this assessment is malformed.</p>
        </div>
      </div>

      <div className="space-y-4">
        {(missingStates && missingStates.length > 0) && (
          <div className="bg-white border border-red-100 rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-2">Missing state categories:</h4>
            <ul className="space-y-1">
              {missingStates.map((state, idx) => (
                <li key={idx} className="text-red-800 text-sm">
                  • {state}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(invalidStates && invalidStates.length > 0) && (
          <div className="bg-white border border-red-100 rounded-lg p-4">
            <h4 className="font-bold text-red-900 mb-2">Invalid state data:</h4>
            <p className="text-red-800 text-sm mb-2">These states contain invalid color spectrum data:</p>
            <ul className="space-y-1 text-sm text-red-800">
              {invalidStates.map((state, idx) => (
                <li key={idx} className="ml-4">• {state.replace('_', ' ')}</li>
              ))}
            </ul>
            <p className="text-xs text-red-700 mt-2">
              Each state should have numeric values for: Red, Green, Yellow, Blue (0-100)
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 mb-2">What to try:</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Complete a v3.0 assessment to unlock detailed state analysis</li>
            <li>• If this is a recovered/v2 assessment, upgrade to v3.0</li>
            <li>• Start a new assessment to generate complete v3.0 results</li>
          </ul>
        </div>
      </div>

      {logger.isDebugEnabled() && (
        <div className="mt-4 bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto">
          <h4 className="font-bold mb-2">Debug Info</h4>
          <pre className="text-xs whitespace-pre-wrap">
{JSON.stringify({
  expectedStates: ['interests', 'usual_behavior', 'needs', 'stress_behavior'],
  actualStates: actualStates,
  missingCount: missingStates?.length || 0,
  invalidCount: invalidStates?.length || 0
}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default InternalStatesTab;
