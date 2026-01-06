function Question({ question, number, value, onChange }) {
  const options = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' }
  ];

  const contextLabel = question.context === 'stress' ? '(Under Stress)' : '(Usually)';
  const contextColor = question.context === 'stress' ? 'text-orange-600' : 'text-blue-600';

  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm font-semibold text-gray-500">Question {number}</span>
          <span className={`text-xs font-semibold ${contextColor} uppercase tracking-wide`}>
            {contextLabel}
          </span>
        </div>
        <p className="text-lg text-gray-800">
          {question.text}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`p-3 rounded-lg border-2 transition-all ${
              value === option.value
                ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium">{option.label}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Question;
