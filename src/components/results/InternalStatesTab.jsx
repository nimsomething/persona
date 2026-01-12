import React from 'react';

const InternalStatesTab = ({ results }) => {
  const states = results.birkman_states;

  if (!states) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">Internal States data is not available for this assessment version.</p>
        <p className="text-sm text-yellow-600 mt-2">Upgrade to v3.0 to unlock Interests, Needs, and Stress analysis.</p>
      </div>
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

export default InternalStatesTab;
