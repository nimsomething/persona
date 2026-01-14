import React from 'react';
import birkmanColorsData from '../../data/birkman_colors.json';
import { isValidBirkmanColor } from '../../services/personalityService.js';
import logger from '../../services/loggerService';

const BirkmanColorsTab = ({ results }) => {
  const birkmanColor = results.birkman_color;

  // Render guard - ensure birkman_color is valid
  if (!birkmanColor || typeof birkmanColor !== 'object' ||
      !birkmanColor.primary || !birkmanColor.secondary || !birkmanColor.spectrum) {
    return <BirkmanColorErrorDisplay missingColor={true} />;
  }

  // Additional validation using the scoring utility
  if (!isValidBirkmanColor(birkmanColor)) {
    const invalidParts = [];
    if (typeof birkmanColor.primary !== 'string') invalidParts.push('primary (must be a string)');
    if (typeof birkmanColor.secondary !== 'string') invalidParts.push('secondary (must be a string)');
    if (typeof birkmanColor.spectrum !== 'object') invalidParts.push('spectrum (must be an object with color percentages)');
    else {
      const colors = ['Red', 'Green', 'Yellow', 'Blue'];
      colors.forEach(color => {
        const value = birkmanColor.spectrum?.[color];
        if (typeof value !== 'number' || value < 0 || value > 100) {
          invalidParts.push(`spectrum.${color} (must be a number 0-100, got ${typeof value}: ${value})`);
        }
      });
    }

    return <BirkmanColorErrorDisplay invalidParts={invalidParts} />;
  }

  const primaryColorData = birkmanColorsData.find(c => c.name === birkmanColor.primary) || birkmanColorsData[0];
  const secondaryColorData = birkmanColorsData.find(c => c.name === birkmanColor.secondary);

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
      <div className="grid md:grid-cols-2 gap-8">
        {/* Primary Color Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="h-4 w-full" 
            style={{ backgroundColor: getColorHex(birkmanColor.primary) }}
          />
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-20 h-20 rounded-full shadow-lg flex items-center justify-center text-white text-3xl font-bold"
                style={{ backgroundColor: getColorHex(birkmanColor.primary) }}
              >
                {birkmanColor.primary.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Primary Color</span>
                <h3 className="text-3xl font-bold text-gray-900">{birkmanColor.primary}</h3>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              {primaryColorData.description}
            </p>
            
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900">Key Characteristics:</h4>
              <ul className="grid grid-cols-2 gap-3">
                {primaryColorData.characteristics.map((char, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getColorHex(birkmanColor.primary) }} />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Secondary Color Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="h-4 w-full" 
            style={{ backgroundColor: getColorHex(birkmanColor.secondary) }}
          />
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-full shadow-md flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: getColorHex(birkmanColor.secondary) }}
              >
                {birkmanColor.secondary.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Secondary Color</span>
                <h3 className="text-2xl font-bold text-gray-900">{birkmanColor.secondary}</h3>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {secondaryColorData?.description}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Color Blend Insight:</h4>
              <p className="text-sm text-gray-700 italic">
                The blend of {birkmanColor.primary} and {birkmanColor.secondary} indicates a profile that balances {primaryColorData.characteristics[0].toLowerCase()} with {secondaryColorData?.characteristics[0].toLowerCase() || 'adaptability'}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Color Spectrum Visualization */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Color Spectrum Breakdown</h3>
        <div className="space-y-6">
          {Object.entries(birkmanColor.spectrum).map(([color, percent]) => (
            <div key={color} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-700">{color}</span>
                <span className="text-sm font-medium text-gray-500">{percent}%</span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${percent}%`,
                    backgroundColor: getColorHex(color)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-gray-500 italic text-center">
          The spectrum shows your relative alignment across all four Birkman colors, representing the complexity of your personality.
        </p>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
        <h3 className="text-xl font-bold mb-4">Workplace Applications</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-indigo-300 mb-2">In Teams</h4>
            <p className="text-sm text-gray-300">{primaryColorData.workplace_dynamics.team_contribution}</p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-300 mb-2">In Communication</h4>
            <p className="text-sm text-gray-300">{primaryColorData.workplace_dynamics.communication_style}</p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-300 mb-2">Under Pressure</h4>
            <p className="text-sm text-gray-300">{primaryColorData.workplace_dynamics.stress_response}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirkmanColorsTab;
