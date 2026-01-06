import archetypesData from '../data/archetypes.json';

export function calculateDimensionScores(answers, questions) {
  const dimensions = ['assertiveness', 'sociability', 'patience', 'flexibility', 'conscientiousness', 'emotional_intelligence'];
  const contexts = ['usual', 'stress'];
  
  const scores = {};
  
  dimensions.forEach(dimension => {
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
      scores[key] = Math.round(percentile);
    });
  });
  
  return scores;
}

export function determineArchetype(scores) {
  const dimensions = ['assertiveness', 'sociability', 'patience', 'flexibility', 'conscientiousness', 'emotional_intelligence'];
  
  const usualScores = {};
  dimensions.forEach(dim => {
    usualScores[dim] = scores[`${dim}_usual`];
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
    return archetype;
  }
  
  const fallbackMap = {
    'assertiveness': ['strategist', 'innovator', 'leader'],
    'sociability': ['connector', 'catalyst', 'advocate'],
    'patience': ['stabilizer', 'analyst'],
    'flexibility': ['innovator', 'catalyst'],
    'conscientiousness': ['strategist', 'stabilizer', 'analyst'],
    'emotional_intelligence': ['connector', 'advocate', 'leader']
  };
  
  const topDimension = sortedDimensions[0][0];
  const possibleArchetypes = fallbackMap[topDimension] || [];
  const archetypeId = possibleArchetypes[0] || 'leader';
  
  return archetypesData.find(a => a.id === archetypeId) || archetypesData[0];
}

export function calculateStressDeltas(scores) {
  const dimensions = ['assertiveness', 'sociability', 'patience', 'flexibility', 'conscientiousness', 'emotional_intelligence'];
  
  const deltas = {};
  dimensions.forEach(dim => {
    const usual = scores[`${dim}_usual`];
    const stress = scores[`${dim}_stress`];
    deltas[dim] = stress - usual;
  });
  
  return deltas;
}

export function calculateAdaptabilityScore(deltas) {
  const totalAbsoluteChange = Object.values(deltas).reduce((sum, delta) => sum + Math.abs(delta), 0);
  const adaptability = 100 - (totalAbsoluteChange / 6);
  return Math.max(0, Math.round(adaptability));
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
