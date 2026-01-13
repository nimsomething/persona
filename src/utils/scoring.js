import archetypesData from '../data/archetypes.json';
import mbtiService from '../services/mbtiMappingService';
import birkmanMappingService from '../services/birkmanMappingService';
import logger from '../services/loggerService';

const ALL_DIMENSIONS = [
  'assertiveness', 'sociability', 'conscientiousness', 'flexibility', 'emotional_intelligence',
  'creativity', 'risk_appetite', 'theoretical_orientation'
];

const VALUES_DIMENSIONS = ['values_autonomy', 'values_mastery', 'values_purpose', 'values_security', 'values_recognition', 'values_expression'];
const WORK_STYLE_DIMENSIONS = ['work_pace', 'work_structure', 'work_autonomy', 'work_social', 'work_sensory'];

export function calculateDimensionScores(answers, questions) {
  const contexts = ['usual', 'stress'];
  const allDimensions = [...ALL_DIMENSIONS, ...VALUES_DIMENSIONS, ...WORK_STYLE_DIMENSIONS];
  
  const scores = {};
  
  // Calculate scores for core dimensions
  ALL_DIMENSIONS.forEach(dimension => {
    contexts.forEach(context => {
      const dimensionQuestions = questions.filter(
        q => q.dimension === dimension && q.context === context
      );
      
      let totalScore = 0;
      let answeredCount = 0;
      
      dimensionQuestions.forEach(question => {
        const answer = answers[question.id];
        if (answer !== undefined && answer !== null) {
          let score = answer;
          if (question.reverse) {
            score = 6 - answer;
          }
          totalScore += score;
          answeredCount++;
        }
      });
      
      const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;
      const percentile = ((averageScore - 1) / 4) * 100;
      
      const key = `${dimension}_${context}`;
      scores[key] = Math.round(Math.max(0, Math.min(100, percentile)));
    });
  });

  // Calculate aggregated scores
  scores.assertiveness_usual = Math.round((scores.assertiveness_usual + scores.assertiveness_stress) / 2);
  scores.sociability_usual = Math.round((scores.sociability_usual + scores.sociability_stress) / 2);
  scores.conscientiousness_usual = Math.round((scores.conscientiousness_usual + scores.conscientiousness_stress) / 2);
  scores.flexibility_usual = Math.round((scores.flexibility_usual + scores.flexibility_stress) / 2);
  scores.emotional_intelligence_usual = Math.round((scores.emotional_intelligence_usual + scores.emotional_intelligence_stress) / 2);

  // Calculate values profile (stored separately, not in scores)
  const valuesProfile = calculateValuesProfile(answers, questions);

  // Calculate work style profile (stored separately, not in scores)
  const workStyleProfile = calculateWorkStyleProfile(answers, questions);
  
  // v3 enhancements: Calculate components, Birkman color, and internal states
  const components = calculateComponentScores(scores, answers, questions);
  const birkmanStates = calculateBirkmanStates(answers, questions);
  const birkmanColor = calculateBirkmanColor(scores, birkmanStates);

  // Final validation: Ensure scores only contains primitive values
  const primitiveScores = {};
  Object.entries(scores).forEach(([key, value]) => {
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      primitiveScores[key] = value;
    } else {
      logger.warn('scoring', `Filtered out non-primitive score: ${key}`, { type: typeof value });
    }
  });

  return {
    ...primitiveScores,
    values_profile: valuesProfile,
    work_style_profile: workStyleProfile,
    components,
    birkman_color: birkmanColor,
    birkman_states: birkmanStates
  };
}

export function calculateValuesProfile(answers, questions) {
  const valuesData = {};
  const valuesQuestions = questions.filter(q => q.dimension.startsWith('values_'));
  
  // Group questions by value type
  VALUES_DIMENSIONS.forEach(valueDim => {
    const valueType = valueDim.replace('values_', '');
    const typedQuestions = valuesQuestions.filter(q => q.dimension === valueDim);
    
    let totalScore = 0;
    let answeredCount = 0;
    
    typedQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined && answer !== null) {
        let score = answer;
        if (question.reverse) {
          score = 6 - answer;
        }
        totalScore += score;
        answeredCount++;
      }
    });
    
    const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;
    const percentile = Math.round(((averageScore - 1) / 4) * 100);
    valuesData[valueType] = Math.max(0, Math.min(100, percentile));
  });
  
  return valuesData;
}

export function calculateWorkStyleProfile(answers, questions) {
  const workStyleData = {};
  const workStyleQuestions = questions.filter(q => q.dimension.startsWith('work_'));
  
  // Group questions by work style type
  WORK_STYLE_DIMENSIONS.forEach(styleDim => {
    const styleType = styleDim.replace('work_', '');
    const styledQuestions = workStyleQuestions.filter(q => q.dimension === styleDim);
    
    let totalScore = 0;
    let answeredCount = 0;
    
    styledQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined && answer !== null) {
        let score = answer;
        if (question.reverse) {
          score = 6 - answer;
        }
        totalScore += score;
        answeredCount++;
      }
    });
    
    const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;
    const percentile = Math.round(((averageScore - 1) / 4) * 100);
    workStyleData[styleType] = Math.max(0, Math.min(100, percentile));
  });
  
  return workStyleData;
}

export function determineArchetype(scores) {
  const usualScores = {};
  ALL_DIMENSIONS.forEach(dim => {
    usualScores[dim] = scores[`${dim}_usual`] || 0;
  });
  
  const sortedDimensions = Object.entries(usualScores)
    .sort(([, a], [, b]) => b - a);
  
  const topDimensions = sortedDimensions.slice(0, 2).map(([dim]) => dim);
  
  const archetype = archetypesData.find(arch => {
    const primaryDims = arch.primaryDimensions;
    return primaryDims.every(dim => topDimensions.includes(dim)) && 
           topDimensions.every(dim => primaryDims.includes(dim));
  });
  
  if (archetype) {
    return {
      ...archetype,
      dimensions: usualScores,
      confidence: 85 // High confidence for exact matches
    };
  }
  
  // Find best match based on overlap
  let bestMatch = null;
  let highestOverlap = 0;
  
  archetypesData.forEach(arch => {
    const overlap = arch.primaryDimensions.filter(dim => 
      sortedDimensions.slice(0, 3).map(([d]) => d).includes(dim)
    ).length;
    
    if (overlap > highestOverlap) {
      highestOverlap = overlap;
      bestMatch = arch;
    }
  });
  
  if (bestMatch) {
    return {
      ...bestMatch,
      dimensions: usualScores,
      confidence: 60 + (highestOverlap * 10), // 70-80% confidence for partial matches
      isPartialMatch: true
    };
  }
  
  // Default to Strategist if no match found
  return {
    ...archetypesData[0],
    dimensions: usualScores,
    confidence: 40,
    isDefault: true
  };
}

export function calculateStressDeltas(scores) {
  const deltas = {};
  ALL_DIMENSIONS.forEach(dim => {
    const usual = scores[`${dim}_usual`] || 0;
    const stress = scores[`${dim}_stress`] || 0;
    deltas[dim] = stress - usual;
  });
  
  return deltas;
}

export function calculateAdaptabilityScore(deltas) {
  // Average absolute change across dimensions
  const totalAbsoluteChange = Object.values(deltas).reduce((sum, delta) => sum + Math.abs(delta), 0);
  const adaptability = 100 - (totalAbsoluteChange / ALL_DIMENSIONS.length);
  return Math.max(0, Math.round(adaptability));
}

export function calculateResilienceProfile(mbtiType, deltas) {
  const resilienceFactors = {
    adaptability: calculateAdaptabilityScore(deltas),
    stressAwareness: Object.values(deltas).filter(delta => Math.abs(delta) > 20).length,
    primaryStrengths: []
  };

  // Identify most stable dimensions under stress
  const stableDimensions = Object.entries(deltas)
    .filter(([, delta]) => Math.abs(delta) < 15)
    .map(([dim]) => dim);

  resilienceFactors.primaryStrengths = stableDimensions.slice(0, 3);

  return resilienceFactors;
}

export function getScoreLevel(score) {
  if (score <= 33) return 'low';
  if (score <= 66) return 'medium';
  return 'high';
}

export function getScoreColor(score) {
  if (score <= 33) return '#3b82f6';
  if (score <= 66) return '#f59e0b';
  return '#10b981';
}

export function generateCBPersonalizedNarrative(archetype, scores, mbti) {
  const narrative = [];
  
  const primArchetype = archetype?.name || 'Professional';
  const valuesProfile = scores?.values_profile || {};
  
  // Primary archetype narrative with specific scores
  narrative.push(`As a ${primArchetype}, your assertiveness (${scores?.assertiveness_usual ?? 50}th percentile) drives you to take charge when needed.`);
  
  // Values integration
  const topValues = Object.entries(valuesProfile)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([value]) => value);
    
  if (topValues.includes('autonomy') && topValues.includes('mastery')) {
    narrative.push("You're particularly driven by autonomy and mastery—seeking freedom to choose your approach while developing deep expertise.");
  }
  
  // Work style preferences
  const workStyle = scores?.work_style_profile || {};
  if (workStyle.pace > 70) {
    narrative.push("Fast-paced environments energize you, where rapid changes and urgent priorities keep you engaged.");
  }
  
  // Theoretical vs practical orientation
  const theoretical = scores?.theoretical_orientation_usual ?? 50;
  if (theoretical > 70) {
    narrative.push("You naturally gravitate toward understanding underlying principles and developing conceptual frameworks.");
  } else if (theoretical < 30) {
    narrative.push("You prefer learning through hands-on practice, focusing on practical application over abstract theory.");
  }
  
  return narrative.join(" ");
}

export function calculateOverallResilience(deltas) {
  const adaptability = calculateAdaptabilityScore(deltas || {});
  
  // Count significant changes (>25 percentile points)
  const significantChanges = Object.values(deltas || {}).filter(delta => Math.abs(delta) > 25).length;
  
  let resilienceLevel;
  if (adaptability >= 80 && significantChanges <= 1) {
    resilienceLevel = 'High';
  } else if (adaptability >= 60 && significantChanges <= 3) {
    resilienceLevel = 'Medium';
  } else {
    resilienceLevel = 'Developing';
  }
  
  return {
    score: adaptability,
    level: resilienceLevel,
    significantChanges
  };
}

/**
 * Calculate 9 component scores from dimension scores
 * @param {Object} dimensionScores - The dimension scores
 * @param {Object} answers - User answers
 * @param {Array} questions - All questions
 * @returns {Object} - 9 component scores (0-100)
 */
export function calculateComponentScores(dimensionScores, answers, questions) {
  try {
    const components = birkmanMappingService.calculateComponents(answers, questions, dimensionScores);

    // Validate return type
    if (!components || typeof components !== 'object') {
      logger.error('scoring', 'calculateComponentScores returned invalid type', { type: typeof components });
      return {
        social_energy: 50,
        physical_energy: 50,
        emotional_energy: 50,
        self_consciousness: 50,
        assertiveness: 50,
        insistence: 50,
        incentives: 50,
        restlessness: 50,
        thought: 50
      };
    }

    // Ensure all values are numbers
    const numericComponents = {};
    Object.entries(components).forEach(([key, value]) => {
      numericComponents[key] = typeof value === 'number' ? value : 50;
    });

    logger.info('scoring', 'Component scores calculated successfully', { components: numericComponents });
    return numericComponents;
  } catch (error) {
    logger.error('scoring', 'Error in calculateComponentScores', { error: error.message });
    return {
      social_energy: 50,
      physical_energy: 50,
      emotional_energy: 50,
      self_consciousness: 50,
      assertiveness: 50,
      insistence: 50,
      incentives: 50,
      restlessness: 50,
      thought: 50
    };
  }
}

/**
 * Calculate internal states (interests, usual_behavior, needs, stress_behavior)
 * @param {Object} answers - User answers
 * @param {Array} questions - All questions
 * @returns {Object} - Internal states with color spectrums
 */
export function calculateBirkmanStates(answers, questions) {
  try {
    const states = birkmanMappingService.calculateInternalStates(answers, questions);

    // Validate return type
    if (!states || typeof states !== 'object') {
      logger.error('scoring', 'calculateBirkmanStates returned invalid type', { type: typeof states });
      return {
        interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
      };
    }

    // Validate required keys exist
    const requiredStates = ['interests', 'usual_behavior', 'needs', 'stress_behavior'];
    for (const stateKey of requiredStates) {
      if (!states[stateKey] || typeof states[stateKey] !== 'object') {
        logger.error('scoring', `Missing or invalid state: ${stateKey}`);
        return {
          interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
          usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
          needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
          stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
        };
      }
    }

    logger.info('scoring', 'Birkman states calculated successfully');
    return states;
  } catch (error) {
    logger.error('scoring', 'Error in calculateBirkmanStates', { error: error.message });
    return {
      interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
      usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
      needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
      stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
    };
  }
}

/**
 * Calculate Birkman color from dimension scores and states
 * @param {Object} dimensionScores - The dimension scores
 * @param {Object} birkmanStates - The internal states
 * @returns {Object} - {primary, secondary, spectrum}
 */
export function calculateBirkmanColor(dimensionScores, birkmanStates) {
  try {
    const birkmanColor = birkmanMappingService.calculateBirkmanColor(dimensionScores, birkmanStates);

    // Validate return type
    if (!birkmanColor || typeof birkmanColor !== 'object') {
      logger.error('scoring', 'calculateBirkmanColor returned invalid type', { type: typeof birkmanColor });
      return {
        primary: 'Yellow',
        secondary: 'Blue',
        spectrum: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
      };
    }

    // Validate required keys
    if (!birkmanColor.primary || typeof birkmanColor.primary !== 'string') {
      logger.error('scoring', 'Missing or invalid primary color in birkmanColor');
      return {
        primary: 'Yellow',
        secondary: 'Blue',
        spectrum: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
      };
    }

    if (!birkmanColor.secondary || typeof birkmanColor.secondary !== 'string') {
      logger.error('scoring', 'Missing or invalid secondary color in birkmanColor');
      birkmanColor.secondary = 'Blue';
    }

    if (!birkmanColor.spectrum || typeof birkmanColor.spectrum !== 'object') {
      logger.error('scoring', 'Missing or invalid spectrum in birkmanColor');
      birkmanColor.spectrum = { Red: 25, Green: 25, Yellow: 25, Blue: 25 };
    }

    logger.info('scoring', 'Birkman color calculated successfully', {
      primary: birkmanColor.primary,
      secondary: birkmanColor.secondary
    });

    return birkmanColor;
  } catch (error) {
    logger.error('scoring', 'Error in calculateBirkmanColor', { error: error.message });
    return {
      primary: 'Yellow',
      secondary: 'Blue',
      spectrum: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
    };
  }
}

/**
 * Blend v2 assessment results with upgrade answers to create v3 results
 * @param {Object} v2Assessment - The v2 assessment
 * @param {Object} upgradeAnswers - Answers to upgrade questions
 * @param {Array} upgradeQuestions - The upgrade questions
 * @returns {Object} - Blended v3 results
 */
export function blendV2withUpgradeAnswers(v2Assessment, upgradeAnswers, upgradeQuestions) {
  try {
    // Preserve v2 dimension scores
    const v2Dimensions = v2Assessment.dimensionScores || v2Assessment.results?.dimensions || {};
    
    // Calculate components from upgrade answers
    const upgradeComponents = birkmanMappingService.calculateComponentsFromUpgradeAnswers(
      upgradeAnswers,
      upgradeQuestions
    );
    
    // Blend components with v2 dimensions
    const blendedComponents = {
      social_energy: Math.round((upgradeComponents.social_energy * 0.5) + ((v2Dimensions.sociability_usual || 50) * 0.5)),
      physical_energy: upgradeComponents.physical_energy,
      emotional_energy: Math.round((upgradeComponents.emotional_energy * 0.5) + ((v2Dimensions.emotional_intelligence_usual || 50) * 0.5)),
      self_consciousness: upgradeComponents.self_consciousness,
      assertiveness: Math.round((upgradeComponents.assertiveness * 0.4) + ((v2Dimensions.assertiveness_usual || 50) * 0.6)),
      insistence: Math.round((upgradeComponents.insistence * 0.6) + ((v2Dimensions.conscientiousness_usual || 50) * 0.4)),
      incentives: upgradeComponents.incentives,
      restlessness: Math.round((upgradeComponents.restlessness * 0.5) + ((v2Dimensions.flexibility_usual || 50) * 0.5)),
      thought: Math.round((upgradeComponents.thought * 0.4) + ((v2Dimensions.theoretical_orientation_usual || 50) * 0.6))
    };
    
    // Calculate Birkman color
    const birkmanColor = birkmanMappingService.calculateBirkmanColor(v2Dimensions);
    
    // Calculate internal states
    const birkmanStates = birkmanMappingService.calculateInternalStates(upgradeAnswers, upgradeQuestions);
    
    return {
      dimensions: v2Dimensions,
      components: blendedComponents,
      birkman_color: birkmanColor,
      birkman_states: birkmanStates,
      archetype: v2Assessment.archetype || v2Assessment.results?.archetype,
      mbtiType: v2Assessment.mbtiType || v2Assessment.results?.mbtiType,
      values_profile: v2Assessment.values_profile || v2Assessment.results?.values_profile,
      work_style_profile: v2Assessment.work_style_profile || v2Assessment.results?.work_style_profile
    };
  } catch (error) {
    console.error('Error blending v2 with upgrade answers:', error);
    throw error;
  }
}

/**
 * Get archetype with Birkman color mapping
 * @param {Object} scores - All scores including Birkman color
 * @returns {Object} - Enhanced archetype data
 */
export function getArchetypeFromScores(scores) {
  const archetype = determineArchetype(scores);

  // Add Birkman color to archetype
  if (scores.birkman_color) {
    archetype.birkman_color = scores.birkman_color.primary;
    archetype.birkman_secondary = scores.birkman_color.secondary;
  }

  return archetype;
}

/**
 * Data validation helpers to prevent object rendering errors
 */

/**
 * Validate that an object contains only numeric values
 * @param {Object} obj - Object to validate
 * @returns {Boolean} - True if all values are numbers
 */
export function isValidNumericObject(obj) {
  if (!obj || typeof obj !== 'object') return false;
  return Object.values(obj).every(val => typeof val === 'number');
}

/**
 * Validate components structure (9 components, all numbers)
 * @param {Object} components - Components object to validate
 * @returns {Boolean} - True if valid
 */
export function isValidComponents(components) {
  if (!components || typeof components !== 'object') return false;

  const requiredComponents = [
    'social_energy', 'physical_energy', 'emotional_energy', 'self_consciousness',
    'assertiveness', 'insistence', 'incentives', 'restlessness', 'thought'
  ];

  // Check all required keys exist
  for (const comp of requiredComponents) {
    if (components[comp] === undefined || typeof components[comp] !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Validate Birkman color structure
 * @param {Object} birkmanColor - Birkman color object to validate
 * @returns {Boolean} - True if valid
 */
export function isValidBirkmanColor(birkmanColor) {
  if (!birkmanColor || typeof birkmanColor !== 'object') return false;
  if (!birkmanColor.primary || typeof birkmanColor.primary !== 'string') return false;
  if (!birkmanColor.secondary || typeof birkmanColor.secondary !== 'string') return false;
  if (!birkmanColor.spectrum || typeof birkmanColor.spectrum !== 'object') return false;

  const validColors = ['Red', 'Green', 'Yellow', 'Blue'];
  if (!validColors.includes(birkmanColor.primary)) return false;
  if (!validColors.includes(birkmanColor.secondary)) return false;

  // Validate spectrum has all 4 colors with numeric values
  for (const color of validColors) {
    if (birkmanColor.spectrum[color] === undefined || typeof birkmanColor.spectrum[color] !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Validate internal states structure
 * @param {Object} birkmanStates - Internal states object to validate
 * @returns {Boolean} - True if valid
 */
export function isValidBirkmanStates(birkmanStates) {
  if (!birkmanStates || typeof birkmanStates !== 'object') return false;

  const requiredStates = ['interests', 'usual_behavior', 'needs', 'stress_behavior'];
  const validColors = ['Red', 'Green', 'Yellow', 'Blue'];

  // Check all required states exist
  for (const state of requiredStates) {
    if (!birkmanStates[state] || typeof birkmanStates[state] !== 'object') {
      return false;
    }

    // Validate each state has all 4 colors with numeric values
    for (const color of validColors) {
      if (birkmanStates[state][color] === undefined || typeof birkmanStates[state][color] !== 'number') {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validate scores structure (dimension scores)
 * @param {Object} scores - Scores object to validate
 * @returns {Boolean} - True if valid
 */
export function isValidScores(scores) {
  if (!scores || typeof scores !== 'object') return false;

  // Filter out non-primitive values (objects, arrays, etc.)
  const invalidEntries = Object.entries(scores).filter(
    ([key, value]) => typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean'
  );

  if (invalidEntries.length > 0) {
    return false;
  }

  return true;
}