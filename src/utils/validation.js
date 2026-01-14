/**
 * Validation Utilities for Assessment Data
 * Provides comprehensive validation for scores, components, Birkman data, and assessment structures
 * Used by scoring.js, storageService.js, and components to ensure data integrity
 */

import logger from '../services/loggerService';

// ========== Core Validation Helpers ==========

/**
 * Validates that an object contains only numeric values (allows null values)
 * @param {Object} obj - Object to validate
 * @returns {boolean} True if all values are numbers or null
 */
export function isValidNumericObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  
  const values = Object.values(obj);
  if (values.length === 0) return false;
  
  return values.every(val => typeof val === 'number' || val === null);
}

/**
 * Validates 9-component structure with numeric values
 * @param {Object} components - Components object to validate
 * @returns {boolean} True if valid 9-component structure
 */
export function isValidComponents(components) {
  if (!components || typeof components !== 'object') return false;
  
  const requiredKeys = [
    'social_energy', 'physical_energy', 'emotional_energy', 'self_consciousness',
    'assertiveness', 'insistence', 'incentives', 'restlessness', 'thought'
  ];
  
  const hasAllKeys = requiredKeys.every(key => 
    components.hasOwnProperty(key) && typeof components[key] === 'number'
  );
  
  return hasAllKeys && Object.keys(components).length === 9;
}

/**
 * Validates Birkman color structure
 * @param {Object} color - Birkman color object to validate
 * @returns {boolean} True if valid color structure
 */
export function isValidBirkmanColor(color) {
  if (!color || typeof color !== 'object') return false;
  
  const hasRequiredKeys = color.hasOwnProperty('primary') && 
                          color.hasOwnProperty('secondary') && 
                          color.hasOwnProperty('spectrum');
  
  if (!hasRequiredKeys) return false;
  
  const validPrimaries = ['Red', 'Green', 'Yellow', 'Blue'];
  const isValidPrimary = validPrimaries.includes(color.primary);
  const isValidSecondary = validPrimaries.includes(color.secondary);
  
  const isValidSpectrum = typeof color.spectrum === 'object' && 
                         ['Red', 'Green', 'Yellow', 'Blue'].every(color => 
                           typeof color.spectrum[color] === 'number'
                         );
  
  return isValidPrimary && isValidSecondary && isValidSpectrum;
}

/**
 * Validates Birkman internal states structure
 * @param {Object} states - Birkman states object to validate
 * @returns {boolean} True if valid states structure
 */
export function isValidBirkmanStates(states) {
  if (!states || typeof states !== 'object') return false;
  
  const requiredStates = ['interests', 'usual_behavior', 'needs', 'stress_behavior'];
  const hasAllStates = requiredStates.every(state => states.hasOwnProperty(state));
  
  if (!hasAllStates) return false;
  
  return requiredStates.every(state => {
    const stateData = states[state];
    return stateData.hasOwnProperty('color') && 
           stateData.hasOwnProperty('score');
  });
}

/**
 * Validates scores object contains only primitive values
 * @param {Object} scores - Scores object to validate
 * @returns {boolean} True if scores contains only primitives (numbers, strings, booleans)
 */
export function isValidScores(scores) {
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return false;
  
  return Object.values(scores).every(value => 
    typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean'
  );
}

/**
 * Validates complete dimension scores structure
 * @param {Object} scores - Dimension scores object
 * @returns {boolean} True if valid dimension scores structure
 */
export function isValidDimensionScores(scores) {
  const REQUIRED_CORE_DIMENSIONS = [
    'assertiveness_usual', 'assertiveness_stress',
    'sociability_usual', 'sociability_stress',
    'conscientiousness_usual', 'conscientiousness_stress',
    'flexibility_usual', 'flexibility_stress',
    'emotional_intelligence_usual', 'emotional_intelligence_stress'
  ];

  if (!scores || typeof scores !== 'object') return false;
  
  const scoreKeys = Object.keys(scores);
  const primitiveValues = Object.values(scores).filter(val => 
    typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean'
  );
  
  if (primitiveValues.length === 0) return false;
  
  return scoreKeys.every(key => {
    const value = scores[key];
    return value === null || 
           value === undefined || 
           typeof value === 'number' || 
           typeof value === 'string' || 
           typeof value === 'boolean';
  });
}

// ========== Detailed Score Diagnosis ==========

/**
 * Performs comprehensive diagnosis of scores object issues
 * @param {Object} scores - Scores object to diagnose
 * @param {boolean} isV3Assessment - Whether this is a v3 assessment
 * @returns {Object} Diagnosis report with issues, warnings, metadata, and suggestions
 */
export function diagnoseScoresIssues(scores, isV3Assessment = false) {
  const issues = [];
  const warnings = [];
  const metadata = {};

  if (!scores || typeof scores !== 'object') {
    return {
      isValid: false,
      issues: ['Scores is not a valid object'],
      warnings,
      metadata: { keyCount: 0, hasInvalidStructure: true },
      suggestion: 'Invalid scores structure detected'
    };
  }

  const scoreKeys = Object.keys(scores);
  const MISSING_CORE_DIMENSIONS = [
    'assertiveness_usual', 'assertiveness_stress',
    'sociability_usual', 'sociability_stress',
    'conscientiousness_usual', 'conscientiousness_stress',
    'flexibility_usual', 'flexibility_stress',
    'emotional_intelligence_usual', 'emotional_intelligence_stress'
  ];

  metadata.keyCount = scoreKeys.length;
  metadata.validCoreDimensions = 0;
  metadata.missingCoreDimensions = [];
  metadata.nonPrimitiveKeys = [];

  // Check for non-primitive values
  const nonPrimitiveKeys = [];
  const nullValueKeys = [];
  const nanValueKeys = [];

  scoreKeys.forEach(key => {
    const value = scores[key];
    
    if (value !== null && typeof value === 'object') {
      nonPrimitiveKeys.push(key);
    } else if (value === null) {
      nullValueKeys.push(key);
    } else if (typeof value === 'number' && isNaN(value)) {
      nanValueKeys.push(key);
    } else if (MISSING_CORE_DIMENSIONS.includes(key) && 
               typeof value === 'number' && 
               value >= 0 && 
               value <= 100) {
      metadata.validCoreDimensions++;
    }
  });

  if (nonPrimitiveKeys.length > 0) {
    issues.push(`Non-primitive values found in keys: ${nonPrimitiveKeys.join(', ')}`);
    metadata.nonPrimitiveKeys = nonPrimitiveKeys;
  }

  if (nullValueKeys.length > 0 && nullValueKeys.length === scoreKeys.length) {
    issues.push('All values are null');
  }

  if (nanValueKeys.length > 0) {
    issues.push(`NaN values found in keys: ${nanValueKeys.join(', ')}`);
    metadata.nanValueKeys = nanValueKeys;
  }

  // Check missing core dimensions
  MISSING_CORE_DIMENSIONS.forEach(dim => {
    if (scores[dim] === undefined || scores[dim] === null) {
      metadata.missingCoreDimensions.push(dim);
    }
  });

  if (metadata.missingCoreDimensions.length === MISSING_CORE_DIMENSIONS.length) {
    issues.push('No valid core dimension scores found');
  } else if (metadata.missingCoreDimensions.length > 0) {
    issues.push(`Missing core dimensions: ${metadata.missingCoreDimensions.join(', ')}`);
  }

  // v2 vs v3 mismatch signals
  const hasValuesDimensions = scoreKeys.some(k => k.startsWith('values_'));
  const hasWorkStyleDimensions = scoreKeys.some(k => k.startsWith('work_'));
  const unscopedCoreKeys = ALL_DIMENSIONS.filter(dim => scores[dim] !== undefined);

  metadata.hasValuesDimensions = hasValuesDimensions;
  metadata.hasWorkStyleDimensions = hasWorkStyleDimensions;

  if (unscopedCoreKeys.length > 0) {
    warnings.push(
      `Found unscoped core dimension keys (${unscopedCoreKeys.join(', ')}). Expected keys like "assertiveness_usual" / "assertiveness_stress".`
    );
    metadata.unscopedCoreKeys = unscopedCoreKeys;
  }

  // Stress dimension checks
  const stressDimensions = MISSING_CORE_DIMENSIONS.map(dim => dim.replace('_usual', '_stress'));
  let stressFound = 0;

  for (const dim of stressDimensions) {
    if (scores[dim] !== undefined && scores[dim] !== null) {
      stressFound++;
    }
  }

  metadata.stressDimensionsFound = stressFound;

  if (stressFound > 0 && metadata.missingCoreDimensions.length > 0) {
    warnings.push(`Partial stress dimension data: ${stressFound}/${stressDimensions.length} found`);
  } else if (stressFound === 0 && isV3Assessment) {
    warnings.push('No stress dimension scores found (v3 assessments typically include *_stress variants)');
  }

  const isLikelyV2 = isV3Assessment && (hasValuesDimensions || hasWorkStyleDimensions) && stressFound === 0;
  metadata.isLikelyV2 = isLikelyV2;

  if (isLikelyV2) {
    warnings.push('v2-like score structure detected in a context expecting v3');
  }

  // Generate suggestion
  let suggestion;
  if (metadata.missingCoreDimensions.length > 0 && metadata.missingCoreDimensions.length < 4) {
    suggestion = 'Some core dimension scores are missing. This often happens when saved data is partially corrupted.';
  } else if (metadata.missingCoreDimensions.length >= 4) {
    suggestion = isLikelyV2
      ? 'This looks like an older (v2) assessment loaded into the v3 app. Use the upgrade flow to convert it.'
      : 'Many required scores are missing, so results cannot be reliably displayed.';
  } else if (nonPrimitiveKeys.length > 0 || nullValueKeys.length > 0 || nanValueKeys.length > 0) {
    suggestion = 'The score data contains invalid values. This can happen with incompatible saved assessments or interrupted saves.';
  } else if (warnings.length > 0 && issues.length === 0) {
    suggestion = 'The score data has minor inconsistencies. Results may still be viewable, but some features could be incomplete.';
  } else {
    suggestion = 'Please restart the assessment to generate complete, valid results.';
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    metadata,
    suggestion,
    nextSteps: [
      'Reload the page to rehydrate saved results.',
      isLikelyV2 ? 'Return to the Welcome screen and use the "Upgrade to v3" option for older saved assessments.' : null,
      issues.some(i => i.includes('non-primitive')) ? 'If this assessment was saved on an older version, retake the assessment (or clear saved results) to avoid incompatible data structures.' : null,
      'If this keeps happening, start a new assessment to generate fresh results.'
    ].filter(Boolean)
  };
}

// ========== Component Validation ==========

/**
 * Validates component score calculations
 * @param {Object} components - Components to validate
 * @returns {Object} Validation result with issues and warnings
 */
export function validateComponentScores(components) {
  const issues = [];
  const warnings = [];

  if (!components || typeof components !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid components structure'],
      warnings
    };
  }

  const componentKeys = Object.keys(components);
  const requiredKeys = [
    'social_energy', 'physical_energy', 'emotional_energy', 'self_consciousness',
    'assertiveness', 'insistence', 'incentives', 'restlessness', 'thought'
  ];

  const missingKeys = requiredKeys.filter(key => !componentKeys.includes(key));
  if (missingKeys.length > 0) {
    issues.push(`Missing required components: ${missingKeys.join(', ')}`);
  }

  // Validate score ranges (0-100)
  const invalidScores = [];
  Object.entries(components).forEach(([key, value]) => {
    if (typeof value === 'number') {
      if (value < 0 || value > 100 || isNaN(value)) {
        invalidScores.push(key);
      }
    } else {
      invalidScores.push(key);
    }
  });

  if (invalidScores.length > 0) {
    issues.push(`Invalid scores for components: ${invalidScores.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    metadata: {
      componentCount: componentKeys.length,
      invalidScores: invalidScores.length
    }
  };
}

// ========== Birkman Validation Helpers ==========

/**
 * Validates Birkman color scores
 * @param {Object} color - Birkman color object
 * @returns {Object} Validation result
 */
export function validateBirkmanColor(color) {
  const issues = [];
  const warnings = [];

  if (!color || typeof color !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid color structure'],
      warnings
    };
  }

  if (!color.primary || !color.secondary || !color.spectrum) {
    issues.push('Missing required color fields: primary, secondary, or spectrum');
  }

  if (color.primary && color.primary === color.secondary) {
    warnings.push('Primary and secondary colors are identical');
  }

  // Validate spectrum sums to approximately 100%
  if (color.spectrum) {
    const spectrumSum = Object.values(color.spectrum).reduce((sum, val) => sum + val, 0);
    if (Math.abs(spectrumSum - 100) > 1) {
      warnings.push(`Color spectrum sums to ${spectrumSum.toFixed(1)}%, expected ~100%`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    metadata: {
      hasSpectrum: !!color.spectrum,
      spectrumSum: color.spectrum ? Object.values(color.spectrum).reduce((sum, val) => sum + val, 0) : 0
    }
  };
}

/**
 * Validates Birkman internal states
 * @param {Object} states - Birkman states object
 * @returns {Object} Validation result
 */
export function validateBirkmanStates(states) {
  const issues = [];

  if (!states || typeof states !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid states structure']
    };
  }

  const requiredStates = ['interests', 'usual_behavior', 'needs', 'stress_behavior'];
  const missingStates = requiredStates.filter(state => !states.hasOwnProperty(state));
  
  if (missingStates.length > 0) {
    issues.push(`Missing required states: ${missingStates.join(', ')}`);
  }

  // Validate each state structure
  requiredStates.forEach(state => {
    if (states[state] && typeof states[state] !== 'object') {
      issues.push(`Invalid structure for state: ${state}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    metadata: {
      stateCount: Object.keys(states).length
    }
  };
}

// ========== Assessment Validation ==========

/**
 * Validates complete assessment structure
 * @param {Object} assessment - Assessment object to validate
 * @returns {Object} Complete validation report
 */
export function validateAssessment(assessment) {
  const issues = [];
  const warnings = [];

  if (!assessment || typeof assessment !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid assessment structure'],
      warnings
    };
  }

  // Check required fields
  if (!assessment.id) issues.push('Missing assessment id');
  if (!assessment.userName) warnings.push('Missing userName');
  if (!assessment.version) warnings.push('Missing version');
  if (!assessment.results) issues.push('Missing results');

  // Validate results structure
  if (assessment.results) {
    const resultsValidation = validateResults(assessment.results);
    if (!resultsValidation.isValid) {
      issues.push(...resultsValidation.issues);
    }
    if (resultsValidation.warnings.length > 0) {
      warnings.push(...resultsValidation.warnings);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    severity: issues.length > 0 ? 'critical' : warnings.length > 0 ? 'warning' : 'ok'
  };
}

/**
 * Validates assessment results structure
 * @param {Object} results - Results object to validate
 * @returns {Object} Validation result
 */
export function validateResults(results) {
  const issues = [];
  const warnings = [];

  if (!results || typeof results !== 'object') {
    return {
      isValid: false,
      issues: ['Invalid results structure']
    };
  }

  // Check for required fields based on version
  if (!results.dimensions && !results.scores) {
    warnings.push('No dimension scores found');
  }

  if (!results.archetype) {
    warnings.push('No archetype found');
  }

  // Validate components if present
  if (results.components && !isValidComponents(results.components)) {
    issues.push('Invalid components structure');
  }

  // Validate Birkman color if present
  if (results.birkman_color && !isValidBirkmanColor(results.birkman_color)) {
    issues.push('Invalid Birkman color structure');
  }

  // Validate Birkman states if present
  if (results.birkman_states && !isValidBirkmanStates(results.birkman_states)) {
    issues.push('Invalid Birkman states structure');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  };
}

// ========== Export all validation functions ==========

export default {
  isValidNumericObject,
  isValidComponents,
  isValidBirkmanColor,
  isValidBirkmanStates,
  isValidScores,
  isValidDimensionScores,
  diagnoseScoresIssues,
  validateComponentScores,
  validateBirkmanColor,
  validateBirkmanStates,
  validateAssessment,
  validateResults
};