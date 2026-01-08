import archetypesData from '../data/archetypes.json';
import mbtiService from '../services/mbtiMappingService';

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
  
  // Calculate values profile
  const valuesScores = calculateValuesProfile(answers, questions);
  scores.values_profile = valuesScores;
  
  // Calculate work style profile
  const workStyleScores = calculateWorkStyleProfile(answers, questions);
  scores.work_style_profile = workStyleScores;
  
  return scores;
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