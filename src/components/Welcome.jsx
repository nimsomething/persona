import { useState } from 'react';
import { APP_VERSION_LABEL } from '../utils/appMeta';

function Welcome({ onStart }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3 flex-wrap">
            <span>Personality Assessment</span>
            <span className="text-sm md:text-base font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              {APP_VERSION_LABEL}
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            A research-grounded profile for creative professionals and team dynamics
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">What to expect (v2):</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>
                  90–120 questions measuring 10 core dimensions and profiles (traits, values, and work style)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Dual Usual/Stress profiles showing how you behave under pressure</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Classified into 8 personality archetypes with your unique blend</span>
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
