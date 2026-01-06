# Scoring Guide

This document explains how the personality assessment scoring works.

## Overview

The assessment measures 6 core dimensions in two contexts (usual and stress), totaling 12 scores. These scores are then used to determine the user's primary archetype and generate personalized insights.

## Dimensions

### The 6 Core Dimensions

1. **Assertiveness** - Initiative, confidence, directness
2. **Sociability** - Openness, engagement, relationship-building
3. **Patience** - Tolerance for ambiguity, calm under pressure
4. **Flexibility** - Adaptability, openness to change
5. **Conscientiousness** - Attention to detail, reliability, planning
6. **Emotional Intelligence** - Empathy, self-awareness, interpersonal sensitivity

### Contexts

- **Usual**: How the person typically behaves in normal circumstances
- **Stress**: How the person behaves when under pressure or stress

## Question Scoring

### Likert Scale

Each question uses a 5-point Likert scale:
- 1 = Strongly Disagree
- 2 = Disagree
- 3 = Neutral
- 4 = Agree
- 5 = Strongly Agree

### Reverse Scoring

Some questions are reverse-scored to avoid response bias. For questions marked `"reverse": true`:
- User selects 1 → Scored as 5
- User selects 2 → Scored as 4
- User selects 3 → Scored as 3
- User selects 4 → Scored as 2
- User selects 5 → Scored as 1

Example reverse-scored question:
```json
{
  "id": 3,
  "dimension": "assertiveness",
  "context": "usual",
  "text": "I prefer to wait for others to take charge rather than stepping forward myself.",
  "reverse": true
}
```

If a user agrees (selects 4), this indicates LOW assertiveness, so it's scored as 2.

## Dimension Score Calculation

### Step 1: Calculate Raw Scores

For each dimension-context combination (e.g., "assertiveness_usual"):

1. Filter questions for that dimension and context
2. Apply reverse scoring where applicable
3. Calculate average score across all questions
4. Convert to percentile (0-100 scale)

Formula:
```
Average Score = Sum of (adjusted) responses / Number of questions
Percentile = ((Average Score - 1) / 4) × 100
```

Example:
- 15 questions for assertiveness_usual
- Adjusted scores: 4, 5, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4
- Average: 4.07
- Percentile: ((4.07 - 1) / 4) × 100 = 76.75 → 77

### Step 2: Score Levels

Scores are categorized into three levels:
- **Low**: 0-33rd percentile
- **Medium**: 34-66th percentile  
- **High**: 67-100th percentile

These levels determine which personalized content is shown in the report.

## Archetype Determination

### Primary Method

1. Rank all 6 dimensions by their "usual" score (highest to lowest)
2. Take the top 2 dimensions
3. Match to archetype based on primary dimensions:

| Archetype | Primary Dimensions |
|-----------|-------------------|
| Strategist | Assertiveness + Conscientiousness |
| Connector | Sociability + Emotional Intelligence |
| Stabilizer | Patience + Conscientiousness |
| Innovator | Flexibility + Assertiveness |
| Advocate | Emotional Intelligence + Sociability |
| Leader | Assertiveness + Emotional Intelligence |
| Analyst | Conscientiousness + Patience |
| Catalyst | Flexibility + Sociability |

### Fallback Method

If top 2 dimensions don't match any archetype exactly, use the highest-scoring dimension to assign a related archetype:

- Assertiveness → Strategist, Innovator, or Leader
- Sociability → Connector, Catalyst, or Advocate
- Patience → Stabilizer or Analyst
- Flexibility → Innovator or Catalyst
- Conscientiousness → Strategist, Stabilizer, or Analyst
- Emotional Intelligence → Connector, Advocate, or Leader

## Stress Delta Calculation

For each dimension:
```
Stress Delta = Stress Score - Usual Score
```

Examples:
- Assertiveness: 75 (usual) → 65 (stress) = -10 (decreases under stress)
- Sociability: 60 (usual) → 80 (stress) = +20 (increases under stress)
- Patience: 55 (usual) → 55 (stress) = 0 (no change)

### Interpretation

- **Positive delta**: Dimension increases under stress
- **Negative delta**: Dimension decreases under stress
- **Large absolute value** (>10): Significant behavioral change
- **Small absolute value** (<10): Relatively consistent behavior

## Adaptability Score

Measures how much a person's behavior changes under stress:

```
Total Change = Sum of absolute values of all stress deltas
Adaptability Score = 100 - (Total Change / 6)
```

Example:
- Deltas: +5, -8, +12, -3, +2, -10
- Total Change: |5| + |-8| + |12| + |-3| + |2| + |-10| = 40
- Adaptability: 100 - (40 / 6) = 93.3 → 93

### Interpretation

- **80-100**: Very consistent under stress
- **60-79**: Moderate behavioral changes under stress
- **0-59**: Significant behavioral shifts under stress

## Personalization Logic

### Dimension Profiles

Each dimension has three narrative templates (low/medium/high) that are selected based on the user's score level. Each template includes:
- General description
- Stress behavior description
- 3 workplace scenarios
- 4 development tips

### Archetype Content

Each archetype has fixed content that applies to anyone matching that type:
- Narrative introduction
- 4 core strengths
- 2-3 blind spots
- 4 career paths
- Team role description
- Leadership style
- Stress triggers
- Coping strategies

### Dynamic Insights

Some content is generated dynamically based on scores:
- Top 3 strengths (highest-scoring dimensions)
- Stress response headline (based on largest delta)
- Career environment recommendations
- Team dynamics (compatibility between archetypes)

## Quality Assurance

### Validation Checks

The application performs these validations:
1. All 90 questions must be answered
2. Each answer must be 1-5
3. Each dimension must have at least 10 questions answered
4. Scores must be between 0-100

### Testing Recommendations

Test with these edge cases:
- All 1s (should produce low scores across the board)
- All 5s (should produce high scores across the board)
- Mixed responses (should produce varied profile)
- Identical usual and stress responses (adaptability = 100)
- Opposite usual and stress responses (low adaptability)

## Data Privacy

**Important**: All scoring happens client-side in the user's browser. No assessment data is sent to any server or stored anywhere except:
- Temporarily in browser memory during the assessment
- In the generated PDF if the user downloads it

The application is completely private and anonymous.
