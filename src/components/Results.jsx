import { useState } from 'react';
import DimensionScorecard from './DimensionScorecard';
import { generatePDF } from '../utils/pdfGeneratorV2';
import { calculateOverallResilience, generateCBPersonalizedNarrative } from '../utils/scoring';
import mbtiService from '../services/mbtiMappingService';

function Results({ userName, results, answers, questions, onRestart }) {
  const [generating, setGenerating] = useState(false);
  const { scores, archetype, stressDeltas, adaptabilityScore } = results;

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

  // Calculate additional v2 features
  const mbti = mbtiService.calculateMBTI(scores);
  const resilience = calculateOverallResilience(stressDeltas);
  const personalizedNarrative = generateCBPersonalizedNarrative(archetype, scores, mbti);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      await generatePDF(userName, results);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const topStrengths = dimensions
    .map(dim => ({
      ...dim,
      score: scores[`${dim.key}_usual`]
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {userName}'s Results
            </h1>
            <p className="text-lg text-gray-600">
              Assessment completed successfully
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{archetype.icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {archetype.name}
              </h2>
              <p className="text-lg text-gray-700">
                {archetype.shortDescription}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">About Your Archetype:</h3>
              <p className="text-gray-700 leading-relaxed">
                {archetype.narrative}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
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

              <div className="bg-white rounded-lg p-6">
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

          <DimensionScorecard scores={scores} dimensions={dimensions} />

          <div className="mt-8 space-y-4">
            <button
              onClick={handleGeneratePDF}
              disabled={generating}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition ${
                generating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
              }`}
            >
              {generating ? 'Generating PDF...' : 'Download Full PDF Report'}
            </button>

            <button
              onClick={onRestart}
              className="w-full py-3 px-6 rounded-lg font-semibold text-blue-600 border-2 border-blue-600 hover:bg-blue-50 transition"
            >
              Take Assessment Again
            </button>
          </div>

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's in Your Full Report:</h3>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Detailed dimension profiles with workplace scenarios</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Complete archetype portrait and team role</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Team dynamics matrix with all 8 archetypes</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Career coaching and development guidance</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Stress triggers and coping strategies</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Personalized recommendations for growth</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
