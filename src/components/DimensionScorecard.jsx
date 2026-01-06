import { getScoreColor } from '../utils/scoring';

function DimensionScorecard({ scores, dimensions }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Dimension Scorecard</h3>
      
      <div className="space-y-6">
        {dimensions.map(dimension => {
          const usualScore = scores[`${dimension.key}_usual`];
          const stressScore = scores[`${dimension.key}_stress`];
          const maxScore = Math.max(usualScore, stressScore, 100);

          return (
            <div key={dimension.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">{dimension.name}</h4>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-600 font-medium">
                    Usual: {usualScore}
                  </span>
                  <span className="text-orange-600 font-medium">
                    Stress: {stressScore}
                  </span>
                </div>
              </div>
              
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 opacity-70 transition-all"
                  style={{ width: `${(usualScore / maxScore) * 100}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-orange-500 opacity-50 transition-all"
                  style={{ width: `${(stressScore / maxScore) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-xs font-semibold text-gray-700">
                    Δ {stressScore - usualScore > 0 ? '+' : ''}{stressScore - usualScore}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 opacity-70 rounded"></div>
          <span className="text-gray-600">Usual Behavior</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 opacity-50 rounded"></div>
          <span className="text-gray-600">Stress Behavior</span>
        </div>
      </div>
    </div>
  );
}

export default DimensionScorecard;
