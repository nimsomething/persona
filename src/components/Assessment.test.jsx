import { render, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Assessment from './Assessment';
import { mockQuestions, mockAnswers } from '../data/mockAssessment';

describe('Assessment', () => {
  it('should call onComplete with the correct results structure', () => {
    const onComplete = vi.fn();
    const { getByText, container } = render(
      <Assessment
        userName="Test User"
        questions={mockQuestions}
        onComplete={onComplete}
      />
    );

    // Answer all questions
    const answerButtons = within(container).getAllByText('Strongly Agree');
    answerButtons.forEach((button) => {
      fireEvent.click(button);
    });

    // Submit the assessment
    const completeButton = getByText('Complete Assessment');
    fireEvent.click(completeButton);

    // Check that onComplete was called
    expect(onComplete).toHaveBeenCalled();

    // Check the structure of the results object
    const results = onComplete.mock.calls[0][1];
    expect(results).toHaveProperty('archetype');
    expect(results).toHaveProperty('stressDeltas');
    expect(results).toHaveProperty('adaptabilityScore');
    expect(results).toHaveProperty('completionTime');
    expect(results).toHaveProperty('scores');
    expect(results).not.toHaveProperty('dimensions');
  });
});
