import { useState } from 'react';
import { APP_VERSION_LABEL } from '../utils/appMeta';
import LocalStorageDebug from './LocalStorageDebug';

function Welcome({ onStart, onStartUpgrade, recoveredAssessment, storageError, onViewRecoveredAssessment, canUpgrade }) {
  const [name, setName] = useState('');
  const [showUpgradeDetails, setShowUpgradeDetails] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3 flex-wrap">
            <span>Birkman Personality Assessment</span>
            <span className="text-sm md:text-base font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
              {APP_VERSION_LABEL}
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Discover your personality strengths & how you thrive in your career
          </p>
        </div>

        {storageError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-xl mr-2">⚠️</span>
              <div>
                <h3 className="font-semibold text-red-800 mb-1">Storage Issue</h3>
                <p className="text-sm text-red-700">{storageError.message}</p>
              </div>
            </div>
          </div>
        )}

        {recoveredAssessment && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start mb-3">
              <span className="text-2xl mr-2">🎉</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Welcome Back!</h3>
                <p className="text-sm text-blue-800">
                  We found your assessment for <strong>{recoveredAssessment.userName}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Completed on {formatDate(recoveredAssessment.completedAt)} • {recoveredAssessment.version}
                </p>
              </div>
            </div>

            {canUpgrade ? (
              <div className="space-y-3 mt-4">
                <button
                  onClick={onStartUpgrade}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                >
                  ⭐ Upgrade to v3.0 (15 min)
                </button>
                <p className="text-xs text-blue-700 text-center">
                  Get Birkman color analysis, 9-component breakdown, and 32-page report!
                </p>
                
                <button
                  onClick={() => setShowUpgradeDetails(!showUpgradeDetails)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline w-full"
                >
                  {showUpgradeDetails ? 'Hide details' : "What's new in v3?"}
                </button>

                {showUpgradeDetails && (
                  <div className="bg-white rounded p-3 text-xs text-gray-700 space-y-1">
                    <p className="font-semibold text-sm text-gray-900">V3 Enhancements:</p>
                    <p>✓ Birkman Color Model (Red, Green, Yellow, Blue)</p>
                    <p>✓ 9 Personality Components with gap analysis</p>
                    <p>✓ Internal States (Interests, Needs, Stress)</p>
                    <p>✓ Career Guidance & Alignment</p>
                    <p>✓ Expanded 32-page PDF (up from 13 pages)</p>
                    <p className="text-blue-600 font-semibold mt-2">Your v2 data is preserved!</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={onViewRecoveredAssessment}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    View v2 Report
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onViewRecoveredAssessment}
                className="w-full mt-3 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                View Previous Results
              </button>
            )}
            <div className="mt-4">
              <LocalStorageDebug />
            </div>
          </div>
        )}

        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn (v3.0):</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span>
                  <strong>Your Birkman Color Type</strong> - Red, Green, Yellow, or Blue personality profile
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>9 Personality Components</strong> - Deep dive into your behavioral patterns</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>Internal States</strong> - Your interests, needs, and stress behavior</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">✓</span>
                <span><strong>Career Guidance</strong> - Personalized career alignment & work environment</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>MBTI cognitive style insights as a secondary layer</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Personalized 10–12 page PDF report you can download</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Save your progress with browser memory (localStorage) — no account needed</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  Designed for creative professionals and team dynamics — with a neurodiversity-friendly,
                  plain-language approach
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Grounded in Big Five personality research</span>
              </li>
            </ul>
          </div>

          <div className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Your report will include:</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>Your primary archetype plus a nuanced blend across dimensions</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>Side-by-side Usual vs Stress patterns — with the biggest shifts highlighted</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>
                  Values and work-style preferences (e.g., autonomy, pace, structure, and sensory needs)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>MBTI cognitive style snapshot to support communication and collaboration</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-2">•</span>
                <span>Personalized guidance for teams, roles, and growth — practical and actionable</span>
              </li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name to begin:
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition duration-200 shadow-lg"
          >
            Begin Assessment
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Answer honestly for the most accurate results. Your progress is saved locally in your browser.
        </p>
      </div>
    </div>
  );
}

export default Welcome;
