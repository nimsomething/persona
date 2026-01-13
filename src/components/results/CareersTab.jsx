import React, { useMemo } from 'react';
import careerFamiliesData from '../../data/career_families.json';
import logger from '../../services/loggerService';

// Utility function for emoji mapping
const getCareerEmoji = (careerId) => {
  const emojiMap = {
    leadership_management: '📈',
    analytical_technical: '💻',
    creative_design: '🎨',
    sales_business_development: '💰',
    helping_service: '🤝',
    administrative_operational: '⚙️',
    entrepreneurial_innovation: '🚀'
  };
  return emojiMap[careerId] || '🛠️';
};

// Utility function to safely get highest component
const getHighestComponent = (components) => {
  if (!components || typeof components !== 'object') {
    return { name: 'Unknown', score: 0 };
  }

  try {
    // Filter to ensure we only have numeric values
    const numericEntries = Object.entries(components).filter(
      ([key, value]) => typeof value === 'number' && !isNaN(value)
    );

    if (numericEntries.length === 0) {
      return { name: 'Unknown', score: 0 };
    }

    const sortedEntries = numericEntries.sort(([,a], [,b]) => b - a);
    const [name, score] = sortedEntries[0];
    return {
      name: name.replace(/_/g, ' '),
      score: score || 0
    };
  } catch (error) {
    logger.error('careers', 'Error getting highest component', { error: error.message });
    return { name: 'Unknown', score: 0 };
  }
};

const CareersTab = ({ results }) => {
  const birkmanColor = results?.birkman_color;
  const components = results?.components;

  // Pre-calculate highest component with safety checks
  const highestComponent = useMemo(() => {
    return getHighestComponent(components);
  }, [components]);

  const careerAlignment = useMemo(() => {
    // Safety checks for inputs
    if (!birkmanColor || typeof birkmanColor !== 'object' ||
        !birkmanColor.primary || !birkmanColor.spectrum ||
        !components || typeof components !== 'object') {
      return [];
    }

    // Validate birkmanColor has valid spectrum
    if (!birkmanColor.spectrum || typeof birkmanColor.spectrum !== 'object') {
      return [];
    }

    return careerFamiliesData.map(family => {
      let score = 0;
      let maxScore = 0;

      // 1. Color alignment (40% of score)
      const colorWeight = 40;
      maxScore += colorWeight;
      
      if (family.birkman_alignment.includes(birkmanColor.primary)) {
        score += colorWeight;
      } else if (family.birkman_alignment.includes(birkmanColor.secondary)) {
        score += colorWeight * 0.7;
      } else {
        // Partial credit for spectrum overlap
        const overlap = family.birkman_alignment.reduce((acc, color) => acc + (birkmanColor.spectrum[color] || 0), 0);
        score += (overlap / 100) * colorWeight;
      }

      // 2. Component alignment (60% of score)
      const componentWeight = 60;
      const componentFit = family.component_fit || {};
      const componentKeys = Object.keys(componentFit);
      const weightPerComponent = componentKeys.length > 0 ? componentWeight / componentKeys.length : 0;

      componentKeys.forEach(key => {
        const target = componentFit[key];
        const userValue = typeof components[key] === 'number' ? components[key] : 50;
        maxScore += weightPerComponent;

        let match = 0;
        if (target === 'high' && userValue >= 70) match = 1;
        else if (target === 'high' && userValue >= 50) match = 0.5;
        else if (target === 'medium' && userValue >= 33 && userValue <= 66) match = 1;
        else if (target === 'medium') match = 0.5;
        else if (target === 'low' && userValue <= 30) match = 1;
        else if (target === 'low' && userValue <= 50) match = 0.5;
        else if (target === 'medium-high' && userValue >= 60) match = 1;
        else if (target === 'medium-high' && userValue >= 40) match = 0.6;
        else if (target === 'low-medium' && userValue <= 40) match = 1;
        else if (target === 'low-medium' && userValue <= 60) match = 0.6;

        score += match * weightPerComponent;
      });

      return {
        ...family,
        alignmentScore: Math.round((score / maxScore) * 100)
      };
    }).sort((a, b) => b.alignmentScore - a.alignmentScore);
  }, [birkmanColor, components]);

  // Pre-calculate top career match info with safety checks
  const topCareerInfo = useMemo(() => {
    if (!careerAlignment || careerAlignment.length === 0) return null;
    const top = careerAlignment[0];
    return {
      name: top.name,
      workEnvironment: top.work_environment ? top.work_environment.toLowerCase() : 'collaborative environments'
    };
  }, [careerAlignment]);

  if (!birkmanColor || !components) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">Career Guidance data is not available for this assessment version.</p>
        <p className="text-sm text-yellow-600 mt-2">Upgrade to v3.0 to unlock career alignment analysis.</p>
      </div>
    );
  }

  const topMatches = careerAlignment.slice(0, 3);
  const otherMatches = careerAlignment.slice(3);

  return (
    <div className="space-y-12 animate-fadeIn pb-12">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Top Career Matches</h3>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Based on your Birkman color profile and 9-component behavioral style, we've identified the career families that best align with your natural strengths and preferences.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {topMatches.map((career, idx) => (
          <div key={career.id} className={`relative bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition transform hover:-translate-y-1 ${
            idx === 0 ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-gray-100'
          }`}>
            {idx === 0 && (
              <div className="bg-indigo-400 text-white text-[10px] font-bold uppercase tracking-widest py-1 text-center">
                Best Alignment
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">
                  {getCareerEmoji(career.id)}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">{career.alignmentScore}%</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Match</div>
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{career.name}</h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{career.description}</p>
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Typical Roles:</div>
                <div className="flex flex-wrap gap-1">
                  {career.typical_roles.slice(0, 3).map(role => (
                    <span key={role} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Other Career Alignments</h3>
        <div className="space-y-4">
          {otherMatches.map(career => (
            <div key={career.id} className="flex items-center gap-6 p-4 rounded-xl hover:bg-gray-50 transition">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {getCareerEmoji(career.id)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{career.name}</h4>
                <p className="text-xs text-gray-500">{career.description.substring(0, 100)}...</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-700">{career.alignmentScore}%</div>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${career.alignmentScore}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="action-plan" className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span>📝</span> Your Action Plan & Next Steps
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-indigo-800/50 rounded-xl p-5 border border-indigo-700">
              <h4 className="font-bold text-indigo-200 mb-2 uppercase text-xs tracking-widest">Key Growth Area</h4>
              <p className="text-sm">
                Focus on leveraging your <strong>{birkmanColor?.primary || 'Unknown'}</strong> strengths while being mindful of your <strong>{highestComponent.name}</strong> score of <strong>{highestComponent.score}</strong>.
              </p>
            </div>
            <div className="bg-indigo-800/50 rounded-xl p-5 border border-indigo-700">
              <h4 className="font-bold text-indigo-200 mb-2 uppercase text-xs tracking-widest">Work Environment</h4>
              <p className="text-sm">
                You thrive best in environments that align with your <strong>{topCareerInfo?.name || 'Professional'}</strong> profile, which typically offer <strong>{topCareerInfo?.workEnvironment || 'collaborative environments'}</strong>.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-indigo-200 uppercase text-xs tracking-widest">Recommended Actions:</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                <span>Review the <strong>9 Components</strong> in your PDF report to understand specific behavioral gaps.</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                <span>Share your <strong>Birkman Color</strong> with your team to improve communication and collaboration.</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                <span>Identify one <strong>Need</strong> from your Internal States and discuss with your manager how to better meet it.</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5">4</span>
                <span>Explore the <strong>{topCareerInfo?.name || 'Professional'}</strong> career family roles for your next career move.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersTab;
