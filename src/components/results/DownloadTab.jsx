import React from 'react';

const DownloadTab = ({ 
  userName, 
  onGeneratePDF, 
  generating, 
  isV3 
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h3 className="text-2xl font-bold mb-2">Your Comprehensive Report</h3>
          <p className="text-blue-100">
            {isV3 
              ? 'Download your personalized 32-page Birkman v3.0 analysis.' 
              : 'Download your personalized 13-page Birkman v2.0 analysis.'}
          </p>
        </div>
        
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-widest">What's included:</h4>
              <ul className="space-y-3">
                {[
                  'Birkman Color Model Analysis',
                  '9 Personality Component Breakdown',
                  'Interests, Needs & Stress Profiles',
                  'Career Alignment & Guidance',
                  'Personalized Action Plan',
                  'Workplace Team Dynamics',
                  'MBTI Cognitive Style Layer'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">📄</div>
                <div>
                  <div className="text-sm font-bold text-gray-900">PDF Report</div>
                  <div className="text-xs text-gray-500">v3.0.0 High-Resolution</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                This report is designed for professional development, career coaching, and team building. It provides deep insights into your behavioral DNA and practical advice for growth.
              </p>
              <button
                onClick={onGeneratePDF}
                disabled={generating}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition transform hover:scale-[1.02] active:scale-[0.98] ${
                  generating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Report...
                  </span>
                ) : (
                  'Download Full Report'
                )}
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Generated for <strong>{userName}</strong> • {new Date().toLocaleDateString()}
            </div>
            <div className="flex gap-4">
              <button className="text-sm font-semibold text-blue-600 hover:underline">
                Email Report
              </button>
              <button className="text-sm font-semibold text-blue-600 hover:underline">
                Share Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100 text-center">
        <h4 className="font-bold text-blue-900 mb-2">Need help interpreting your results?</h4>
        <p className="text-sm text-blue-800 mb-6 max-w-lg mx-auto">
          Our career coaching team can help you dive deeper into your Birkman profile and create a customized professional development plan.
        </p>
        <button className="bg-white text-blue-600 border-2 border-blue-600 py-2 px-6 rounded-lg font-bold hover:bg-blue-600 hover:text-white transition">
          Book a Coaching Session
        </button>
      </div>
    </div>
  );
};

export default DownloadTab;
