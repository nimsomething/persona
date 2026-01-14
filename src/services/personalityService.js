import archetypesData from '../data/archetypes.json';
import birkmanColorsData from '../data/birkman_colors.json';
import logger from './loggerService';

// --- Constants ---

const ALL_DIMENSIONS = [
  'assertiveness', 'sociability', 'conscientiousness', 'flexibility', 'emotional_intelligence',
  'creativity', 'risk_appetite', 'theoretical_orientation'
];

const VALUES_DIMENSIONS = ['values_autonomy', 'values_mastery', 'values_purpose', 'values_security', 'values_recognition', 'values_expression'];
const WORK_STYLE_DIMENSIONS = ['work_pace', 'work_structure', 'work_autonomy', 'work_social', 'work_sensory'];

const MBTI_TYPES = {
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

// --- Private Helper Functions ---

function _calculateConfidence(score, midpoint) {
    const distance = Math.abs(score - midpoint);
    return Math.min(95, Math.round((distance / 50) * 100));
}

function _updateStateFromAnswer(state, question, answer) {
    if (question.id === 135) {
        state.Yellow += answer * 3;
        state.Blue += answer * 2;
    } else if (question.id === 139) {
        state.Green += answer * 4;
    } else if (question.id === 136) {
        state.Red += answer * 4;
    } else if (question.id === 140) {
        state.Red += answer * 4;
    } else if (question.id === 137) {
        state.Red += answer * 2;
        state.Green += answer * 2;
    } else if (question.id === 138) {
        state.Blue += answer * 4;
    }
}

function _calculateColorSpectrum(dimensionScores) {
    const spectrum = { Red: 0, Green: 0, Yellow: 0, Blue: 0 };
    const assertiveness = dimensionScores.assertiveness_usual || 50;
    const sociability = dimensionScores.sociability_usual || 50;
    const creativity = dimensionScores.creativity_usual || 50;
    const theoreticalOrientation = dimensionScores.theoretical_orientation_usual || 50;
    const emotionalIntelligence = dimensionScores.emotional_intelligence_usual || 50;

    spectrum.Red = (assertiveness * 0.4) + ((100 - theoreticalOrientation) * 0.3) + (sociability * 0.3);
    spectrum.Green = (theoreticalOrientation * 0.4) + ((100 - sociability) * 0.3) + ((100 - creativity) * 0.3);
    spectrum.Yellow = (sociability * 0.4) + (emotionalIntelligence * 0.3) + (creativity * 0.3);
    spectrum.Blue = ((100 - assertiveness) * 0.3) + ((100 - sociability) * 0.3) + (emotionalIntelligence * 0.4);

    const total = spectrum.Red + spectrum.Green + spectrum.Yellow + spectrum.Blue;
    Object.keys(spectrum).forEach(color => {
        spectrum[color] = Math.round((spectrum[color] / total) * 100);
    });

    const sum = Object.values(spectrum).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
        const diff = 100 - sum;
        const maxColor = Object.entries(spectrum).sort(([, a], [, b]) => b - a)[0][0];
        spectrum[maxColor] += diff;
    }

    return spectrum;
}

// --- Public API ---

export function calculateDimensionScores(answers, questions) {
    const contexts = ['usual', 'stress'];
    const scores = {};

    ALL_DIMENSIONS.forEach(dimension => {
        contexts.forEach(context => {
            const dimensionQuestions = questions.filter(q => q.dimension === dimension && q.context === context);
            let totalScore = 0;
            let answeredCount = 0;

            dimensionQuestions.forEach(question => {
                const answer = answers[question.id];
                if (answer !== undefined && answer !== null) {
                    let score = question.reverse ? 6 - answer : answer;
                    totalScore += score;
                    answeredCount++;
                }
            });

            const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;
            const percentile = ((averageScore - 1) / 4) * 100;
            scores[`${dimension}_${context}`] = Math.round(Math.max(0, Math.min(100, percentile)));
        });
    });

    // Aggregated scores
    scores.assertiveness_usual = Math.round((scores.assertiveness_usual + scores.assertiveness_stress) / 2);
    scores.sociability_usual = Math.round((scores.sociability_usual + scores.sociability_stress) / 2);
    scores.conscientiousness_usual = Math.round((scores.conscientiousness_usual + scores.conscientiousness_stress) / 2);
    scores.flexibility_usual = Math.round((scores.flexibility_usual + scores.flexibility_stress) / 2);
    scores.emotional_intelligence_usual = Math.round((scores.emotional_intelligence_usual + scores.emotional_intelligence_stress) / 2);

    const valuesProfile = calculateValuesProfile(answers, questions);
    const workStyleProfile = calculateWorkStyleProfile(answers, questions);
    const components = calculateComponents(answers, questions, scores);
    const birkmanStates = calculateBirkmanStates(answers, questions);
    const birkmanColor = calculateBirkmanColor(scores);

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
        birkman_states: birkmanStates,
        mbti: calculateMBTI(scores)
    };
}

export function calculateValuesProfile(answers, questions) {
    const valuesData = {};
    const valuesQuestions = questions.filter(q => q.dimension.startsWith('values_'));

    VALUES_DIMENSIONS.forEach(valueDim => {
        const valueType = valueDim.replace('values_', '');
        const typedQuestions = valuesQuestions.filter(q => q.dimension === valueDim);
        let totalScore = 0;
        let answeredCount = 0;

        typedQuestions.forEach(question => {
            const answer = answers[question.id];
            if (answer !== undefined && answer !== null) {
                totalScore += question.reverse ? 6 - answer : answer;
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

    WORK_STYLE_DIMENSIONS.forEach(styleDim => {
        const styleType = styleDim.replace('work_', '');
        const styledQuestions = workStyleQuestions.filter(q => q.dimension === styleDim);
        let totalScore = 0;
        let answeredCount = 0;

        styledQuestions.forEach(question => {
            const answer = answers[question.id];
            if (answer !== undefined && answer !== null) {
                totalScore += question.reverse ? 6 - answer : answer;
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

    const sortedDimensions = Object.entries(usualScores).sort(([, a], [, b]) => b - a);
    const topDimensions = sortedDimensions.slice(0, 2).map(([dim]) => dim);

    const archetype = archetypesData.find(arch => {
        const primaryDims = arch.primaryDimensions;
        return primaryDims.every(dim => topDimensions.includes(dim)) && topDimensions.every(dim => primaryDims.includes(dim));
    });

    if (archetype) {
        return { ...archetype, dimensions: usualScores, confidence: 85 };
    }

    let bestMatch = null;
    let highestOverlap = 0;
    archetypesData.forEach(arch => {
        const overlap = arch.primaryDimensions.filter(dim => sortedDimensions.slice(0, 3).map(([d]) => d).includes(dim)).length;
        if (overlap > highestOverlap) {
            highestOverlap = overlap;
            bestMatch = arch;
        }
    });

    if (bestMatch) {
        return { ...bestMatch, dimensions: usualScores, confidence: 60 + (highestOverlap * 10), isPartialMatch: true };
    }

    return { ...archetypesData[0], dimensions: usualScores, confidence: 40, isDefault: true };
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
    const totalAbsoluteChange = Object.values(deltas).reduce((sum, delta) => sum + Math.abs(delta), 0);
    const adaptability = 100 - (totalAbsoluteChange / ALL_DIMENSIONS.length);
    return Math.max(0, Math.round(adaptability));
}

export function getScoreLevel(score) {
    if (score <= 33) return 'low';
    if (score <= 66) return 'medium';
    return 'high';
}

export function calculateBirkmanColor(dimensionScores) {
    try {
        const spectrum = _calculateColorSpectrum(dimensionScores);
        const sortedColors = Object.entries(spectrum).sort(([, a], [, b]) => b - a);
        const primary = sortedColors[0][0];
        const secondary = sortedColors[1][0];
        return { primary, secondary, spectrum };
    } catch (error) {
        logger.error('birkman', 'Error calculating Birkman color', { error: error.message });
        return { primary: 'Yellow', secondary: 'Blue', spectrum: { Red: 25, Green: 25, Yellow: 25, Blue: 25 } };
    }
}

export function calculateBirkmanStates(answers, questions) {
    try {
        const internalStateQuestions = questions.filter(q => q.dimension === 'internal_states' && q.context === 'upgrade');
        const states = {
            interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
            usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
            needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
            stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
        };

        internalStateQuestions.forEach(question => {
            const answer = answers[question.id];
            if (answer !== undefined && answer !== null && question.targets && question.targets.length > 0) {
                const targetState = question.targets[0];
                if (states[targetState]) {
                    _updateStateFromAnswer(states[targetState], question, answer);
                }
            }
        });

        Object.keys(states).forEach(stateName => {
            const state = states[stateName];
            const total = Object.values(state).reduce((a, b) => a + b, 0);
            if (total > 0) {
                Object.keys(state).forEach(color => {
                    state[color] = Math.round((state[color] / total) * 100);
                });
            }
            const sum = Object.values(state).reduce((a, b) => a + b, 0);
            if (sum !== 100) {
                const diff = 100 - sum;
                const maxColor = Object.entries(state).sort(([, a], [, b]) => b - a)[0][0];
                state[maxColor] += diff;
            }
        });
        return states;
    } catch (error) {
        logger.error('birkman', 'Error calculating internal states', { error: error.message });
        return {
            interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
            usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
            needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
            stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
        };
    }
}

export function calculateComponents(answers, questions, dimensionScores) {
    try {
        const components = {
            social_energy: dimensionScores.sociability_usual || 50,
            physical_energy: 50,
            emotional_energy: dimensionScores.emotional_intelligence_usual || 50,
            self_consciousness: 50 - (dimensionScores.assertiveness_usual || 50) * 0.5,
            assertiveness: dimensionScores.assertiveness_usual || 50,
            insistence: 50 + (dimensionScores.conscientiousness_usual || 50) * 0.3,
            incentives: 50,
            restlessness: dimensionScores.flexibility_usual || 50,
            thought: dimensionScores.theoretical_orientation_usual || 50
        };

        const componentQuestions = questions.filter(q => q.dimension === 'component_focus' && q.context === 'upgrade');
        componentQuestions.forEach(question => {
            const answer = answers[question.id];
            if (answer !== undefined && answer !== null && question.targets && question.targets.length > 0) {
                const component = question.targets[0];
                if (components[component] !== undefined) {
                    const answerScore = ((answer - 1) / 4) * 100;
                    components[component] = Math.round((components[component] * 0.6) + (answerScore * 0.4));
                }
            }
        });

        Object.keys(components).forEach(key => {
            components[key] = Math.max(0, Math.min(100, Math.round(components[key])));
        });
        return components;
    } catch (error) {
        logger.error('birkman', 'Error calculating components', { error: error.message });
        return {
            social_energy: 50, physical_energy: 50, emotional_energy: 50, self_consciousness: 50,
            assertiveness: 50, insistence: 50, incentives: 50, restlessness: 50, thought: 50
        };
    }
}

export function calculateComponentsFromUpgradeAnswers(upgradeAnswers, upgradeQuestions) {
    try {
        const components = {
            social_energy: 50, physical_energy: 50, emotional_energy: 50, self_consciousness: 50,
            assertiveness: 50, insistence: 50, incentives: 50, restlessness: 50, thought: 50
        };
        const componentQuestions = upgradeQuestions.filter(q => q.dimension === 'component_focus' && q.context === 'upgrade');
        componentQuestions.forEach(question => {
            const answer = upgradeAnswers[question.id];
            if (answer !== undefined && answer !== null && question.targets && question.targets.length > 0) {
                const component = question.targets[0];
                if (components[component] !== undefined) {
                    components[component] = Math.round(((answer - 1) / 4) * 100);
                }
            }
        });
        return components;
    } catch (error) {
        logger.error('birkman', 'Error calculating components from upgrade', { error: error.message });
        return {
            social_energy: 50, physical_energy: 50, emotional_energy: 50, self_consciousness: 50,
            assertiveness: 50, insistence: 50, incentives: 50, restlessness: 50, thought: 50
        };
    }
}

export function getColorDescription(colorName) {
    return birkmanColorsData.find(c => c.name === colorName) || birkmanColorsData[0];
}

export function calculateMBTI(scores) {
    const extraversion = (scores.assertiveness_usual + scores.sociability_usual) / 2;
    const conscientiousness = scores.conscientiousness_usual;
    const openness = (scores.creativity_usual + scores.flexibility_usual) / 2;
    const agreeableness = scores.emotional_intelligence_usual;

    const preferences = {
        E_I: extraversion >= 50 ? 'E' : 'I',
        N_S: openness >= 50 ? 'N' : 'S',
        F_T: agreeableness >= 50 ? 'F' : 'T',
        J_P: conscientiousness >= 50 ? 'J' : 'P'
    };

    const mbtiType = preferences.E_I + preferences.N_S + preferences.F_T + preferences.J_P;

    const confidenceScores = {
        E_I: _calculateConfidence(extraversion, 50),
        N_S: _calculateConfidence(openness, 50),
        F_T: _calculateConfidence(agreeableness, 50),
        J_P: _calculateConfidence(conscientiousness, 50)
    };

    const overallConfidence = Math.round((confidenceScores.E_I + confidenceScores.N_S + confidenceScores.F_T + confidenceScores.J_P) / 4);

    return {
        type: mbtiType,
        confidence: overallConfidence,
        confidenceScores,
        preferences,
        profile: MBTI_TYPES[mbtiType] || MBTI_TYPES['INTJ']
    };
}
