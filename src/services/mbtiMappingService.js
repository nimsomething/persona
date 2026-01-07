class MBTIMappingService {
  constructor() {
    this.mbtiTypes = {
      'INTJ': {
        name: 'INTJ - The Architect',
        description: 'Strategic, conceptual, and independent thinkers who excel at developing long-range plans and innovating systems.',
        cognitiveStack: ['Ni', 'Te', 'Fi', 'Se'],
        traits: ['Strategic', 'Independent', 'Visionary', 'Systematic']
      },
      'INTP': {
        name: 'INTP - The Thinker',
        description: 'Analytical and objective theorists who love exploring concepts and finding logical solutions to complex problems.',
        cognitiveStack: ['Ti', 'Ne', 'Si', 'Fe'],
        traits: ['Analytical', 'Objective', 'Innovative', 'Curious']
      },
      'ENTJ': {
        name: 'ENTJ - The Commander',
        description: 'Bold, strategic leaders who excel at organizing people and resources to achieve ambitious goals efficiently.',
        cognitiveStack: ['Te', 'Ni', 'Se', 'Fi'],
        traits: ['Strategic', 'Decisive', 'Efficient', 'Leadership-focused']
      },
      'ENTP': {
        name: 'ENTP - The Debater',
        description: 'Quick-witted and innovative brainstormers who enjoy exploring possibilities and challenging conventional thinking.',
        cognitiveStack: ['Ne', 'Ti', 'Fe', 'Si'],
        traits: ['Innovative', 'Adaptable', 'Strategic', 'Energetic']
      },
      'INFJ': {
        name: 'INFJ - The Advocate',
        description: 'Insightful and principled idealists who are driven to help others and make a meaningful difference in the world.',
        cognitiveStack: ['Ni', 'Fe', 'Ti', 'Se'],
        traits: ['Insightful', 'Principled', 'Compassionate', 'Visionary']
      },
      'INFP': {
        name: 'INFP - The Mediator',
        description: 'Idealistic and empathetic individuals who seek harmony and are driven by their core values and beliefs.',
        cognitiveStack: ['Fi', 'Ne', 'Si', 'Te'],
        traits: ['Idealistic', 'Empathetic', 'Authentic', 'Flexible']
      },
      'ENFJ': {
        name: 'ENFJ - The Protagonist',
        description: 'Charismatic and inspiring leaders who are driven to help others grow and create positive change.',
        cognitiveStack: ['Fe', 'Ni', 'Se', 'Ti'],
        traits: ['Charismatic', 'Inspiring', 'Altruistic', 'Organized']
      },
      'ENFP': {
        name: 'ENFP - The Campaigner',
        description: 'Enthusiastic and creative free spirits who love exploring possibilities and connecting with others.',
        cognitiveStack: ['Ne', 'Fi', 'Te', 'Si'],
        traits: ['Enthusiastic', 'Creative', 'Sociable', 'Curious']
      },
      'ISTJ': {
        name: 'ISTJ - The Logistician',
        description: 'Practical and detail-oriented individuals who value tradition, stability, and systematic approaches to work.',
        cognitiveStack: ['Si', 'Te', 'Fi', 'Ne'],
        traits: ['Practical', 'Reliable', 'Detail-oriented', 'Systematic']
      },
      'ISFJ': {
        name: 'ISFJ - The Defender',
        description: 'Caring and loyal helpers who are committed to their responsibilities and supporting others.',
        cognitiveStack: ['Si', 'Fe', 'Ti', 'Ne'],
        traits: ['Caring', 'Loyal', 'Practical', 'Supportive']
      },
      'ESTJ': {
        name: 'ESTJ - The Executive',
        description: 'Organized and results-driven leaders who excel at managing people and projects efficiently.',
        cognitiveStack: ['Te', 'Si', 'Ne', 'Fi'],
        traits: ['Organized', 'Efficient', 'Direct', 'Results-driven']
      },
      'ESFJ': {
        name: 'ESFJ - The Consul',
        description: 'Sociable and caring individuals who create harmony and are skilled at understanding others\' needs.',
        cognitiveStack: ['Fe', 'Si', 'Ne', 'Ti'],
        traits: ['Sociable', 'Caring', 'Harmonious', 'Supportive']
      },
      'ISTP': {
        name: 'ISTP - The Virtuoso',
        description: 'Practical and observant problem-solvers who excel at understanding how things work and fixing problems.',
        cognitiveStack: ['Ti', 'Se', 'Ni', 'Fe'],
        traits: ['Practical', 'Observant', 'Adaptable', 'Problem-solver']
      },
      'ISFP': {
        name: 'ISFP - The Adventurer',
        description: 'Gentle and artistic souls who live in the moment and enjoy exploring their environment.',
        cognitiveStack: ['Fi', 'Se', 'Ni', 'Te'],
        traits: ['Gentle', 'Artistic', 'Flexible', 'Observant']
      },
      'ESTP': {
        name: 'ESTP - The Entrepreneur',
        description: 'Energetic and action-oriented individuals who excel at solving problems in the moment.',
        cognitiveStack: ['Se', 'Ti', 'Fe', 'Ni'],
        traits: ['Energetic', 'Practical', 'Direct', 'Adaptable']
      },
      'ESFP': {
        name: 'ESFP - The Entertainer',
        description: 'Spontaneous and enthusiastic performers who love bringing joy to others and living in the moment.',
        cognitiveStack: ['Se', 'Fi', 'Te', 'Ni'],
        traits: ['Spontaneous', 'Enthusiastic', 'Sociable', 'Practical']
      }
    };
  }

  calculateMBTI(scores) {
    // Calculate Big Five proxies
    const extraversion = (scores.assertiveness_usual + scores.sociability_usual) / 2;
    const conscientiousness = scores.conscientiousness_usual;
    const openness = (scores.creativity_usual + scores.flexibility_usual) / 2;
    const agreeableness = scores.emotional_intelligence_usual;
    
    // Determine preferences
    const preferences = {
      E_I: extraversion >= 50 ? 'E' : 'I',
      N_S: openness >= 50 ? 'N' : 'S',
      F_T: agreeableness >= 50 ? 'F' : 'T',
      J_P: conscientiousness >= 50 ? 'J' : 'P'
    };

    const mbtiType = preferences.E_I + preferences.N_S + preferences.F_T + preferences.J_P;
    
    // Calculate confidence scores for each dimension
    const confidenceScores = {
      E_I: this.calculateConfidence(extraversion, 50),
      N_S: this.calculateConfidence(openness, 50),
      F_T: this.calculateConfidence(agreeableness, 50),
      J_P: this.calculateConfidence(conscientiousness, 50)
    };

    const overallConfidence = Math.round(
      (confidenceScores.E_I + confidenceScores.N_S + confidenceScores.F_T + confidenceScores.J_P) / 4
    );

    return {
      type: mbtiType,
      confidence: overallConfidence,
      confidenceScores,
      preferences,
      profile: this.mbtiTypes[mbtiType] || this.mbtiTypes['INTJ'] // Default to INTJ if type not found
    };
  }

  calculateConfidence(score, midpoint) {
    const distance = Math.abs(score - midpoint);
    return Math.min(95, Math.round((distance / 50) * 100));
  }

  getAlternativeInterpretations(scores, primaryType) {
    const alternatives = [];
    const { preferences } = primaryType;

    // Check for near-threshold scores that could suggest alternative types
    const extraversion = (scores.assertiveness_usual + scores.sociability_usual) / 2;
    const openness = (scores.creativity_usual + scores.flexibility_usual) / 2;
    const agreeableness = scores.emotional_intelligence_usual;
    const conscientiousness = scores.conscientiousness_usual;

    if (Math.abs(extraversion - 50) < 10) {
      const altType = (preferences.E_I === 'E' ? 'I' : 'E') + 
                      preferences.N_S + preferences.F_T + preferences.J_P;
      alternatives.push({
        type: altType,
        confidence: 30 + Math.random() * 20, // 30-50% confidence
        reason: 'Your extraversion score is near the midpoint, suggesting you may exhibit qualities of both preferences.'
      });
    }

    if (Math.abs(openness - 50) < 10) {
      const altType = preferences.E_I + 
                      (preferences.N_S === 'N' ? 'S' : 'N') + 
                      preferences.F_T + preferences.J_P;
      alternatives.push({
        type: altType,
        confidence: 30 + Math.random() * 20,
        reason: 'Your openness score is near the midpoint, indicating you balance abstract and concrete thinking.'
      });
    }

    return alternatives.slice(0, 2); // Return max 2 alternatives
  }

  generateInsight(primaryType, archetype, scores) {
    const insights = [];

    // Compare MBTI with archetype
    const archetypeDimensions = archetype.primaryDimensions;
    
    if (primaryType.preferences.E_I === 'E' && archetypeDimensions.includes('sociability')) {
      insights.push("Your MBTI preference for Extraversion aligns with your sociable archetype characteristics.");
    }

    if (primaryType.preferences.J === 'J' && archetypeDimensions.includes('conscientiousness')) {
      insights.push("Your preference for Judging complements your conscientious approach to planning and organization.");
    }

    // Look at creativity/theoretical combinations
    const theoreticalOrientation = scores.theoretical_orientation_usual;
    const creativity = scores.creativity_usual;

    if (creativity > 70 && theoreticalOrientation > 70) {
      insights.push("Your high creativity combined with theoretical orientation suggests you excel at developing innovative conceptual frameworks.");
    } else if (creativity > 70 && theoreticalOrientation < 30) {
      insights.push("Your practical creativity shines through—you generate innovative solutions focused on real-world application.");
    }

    // Work style insights
    const workPace = scores.work_pace_usual;
    const workStructure = scores.work_structure_usual;

    if (workPace > 70 && workStructure < 30) {
      insights.push("You thrive in fast-paced, flexible environments where you can adapt quickly to changing priorities.");
    }

    return insights;
  }
}

export default new MBTIMappingService();