import birkmanColorsData from '../data/birkman_colors.json';
import logger from './loggerService';

class BirkmanMappingService {
  constructor() {
    this.colors = birkmanColorsData;
  }

  /**
   * Calculate Birkman color from dimension scores and internal states
   * @param {Object} dimensionScores - The v2 dimension scores
   * @param {Object} birkmanStateScores - The internal state scores (interests, usual_behavior, needs, stress_behavior)
   * @returns {Object} - {primary, secondary, spectrum}
   */
  calculateBirkmanColor(dimensionScores, birkmanStateScores = null) {
    try {
      logger.info('birkman', 'Calculating Birkman color from dimension scores');

      // Calculate color spectrum percentages
      const spectrum = this.calculateColorSpectrum(dimensionScores, birkmanStateScores);

      // Determine primary and secondary colors
      const sortedColors = Object.entries(spectrum)
        .sort(([, a], [, b]) => b - a);

      const primary = sortedColors[0][0];
      const secondary = sortedColors[1][0];

      logger.info('birkman', `Birkman color calculated: Primary=${primary}, Secondary=${secondary}`);

      return {
        primary,
        secondary,
        spectrum
      };
    } catch (error) {
      logger.error('birkman', 'Error calculating Birkman color', { error: error.message });
      // Default to Yellow if error
      return {
        primary: 'Yellow',
        secondary: 'Blue',
        spectrum: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
      };
    }
  }

  /**
   * Calculate color spectrum percentages from dimension scores
   * @param {Object} dimensionScores - The dimension scores
   * @param {Object} birkmanStateScores - Optional internal state scores
   * @returns {Object} - {Red, Green, Yellow, Blue} percentages
   */
  calculateColorSpectrum(dimensionScores, birkmanStateScores) {
    const spectrum = { Red: 0, Green: 0, Yellow: 0, Blue: 0 };

    // Map dimensions to colors
    const assertiveness = dimensionScores.assertiveness_usual || 50;
    const sociability = dimensionScores.sociability_usual || 50;
    const creativity = dimensionScores.creativity_usual || 50;
    const theoreticalOrientation = dimensionScores.theoretical_orientation_usual || 50;
    const emotionalIntelligence = dimensionScores.emotional_intelligence_usual || 50;
    const flexibility = dimensionScores.flexibility_usual || 50;

    // RED: High assertiveness, task-oriented, extroverted
    // Driven, decisive, results-focused
    spectrum.Red = (assertiveness * 0.4) + ((100 - theoreticalOrientation) * 0.3) + (sociability * 0.3);

    // GREEN: High analytical, task-oriented, introverted
    // Analytical, detail-oriented, systematic
    spectrum.Green = (theoreticalOrientation * 0.4) + ((100 - sociability) * 0.3) + ((100 - creativity) * 0.3);

    // YELLOW: High sociability, people-oriented, extroverted
    // Enthusiastic, collaborative, relationship-focused
    spectrum.Yellow = (sociability * 0.4) + (emotionalIntelligence * 0.3) + (creativity * 0.3);

    // BLUE: High empathy, people-oriented, introverted
    // Supportive, stable, service-oriented
    spectrum.Blue = ((100 - assertiveness) * 0.3) + ((100 - sociability) * 0.3) + (emotionalIntelligence * 0.4);

    // Normalize to 100%
    const total = spectrum.Red + spectrum.Green + spectrum.Yellow + spectrum.Blue;
    Object.keys(spectrum).forEach(color => {
      spectrum[color] = Math.round((spectrum[color] / total) * 100);
    });

    // Ensure they sum to exactly 100 (handle rounding errors)
    const sum = Object.values(spectrum).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
      const diff = 100 - sum;
      const maxColor = Object.entries(spectrum).sort(([, a], [, b]) => b - a)[0][0];
      spectrum[maxColor] += diff;
    }

    return spectrum;
  }

  /**
   * Calculate internal states (interests, usual_behavior, needs, stress_behavior)
   * Each state has its own color spectrum
   * @param {Object} answers - User answers to questions
   * @param {Array} questions - All questions
   * @returns {Object} - {interests, usual_behavior, needs, stress_behavior}
   */
  calculateInternalStates(answers, questions) {
    try {
      logger.info('birkman', 'Calculating internal states');

      // Filter upgrade questions that target internal states
      const internalStateQuestions = questions.filter(
        q => q.dimension === 'internal_states' && q.context === 'upgrade'
      );

      const states = {
        interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
      };

      // Calculate each state from upgrade questions
      internalStateQuestions.forEach(question => {
        const answer = answers[question.id];
        if (answer !== undefined && answer !== null && question.targets && question.targets.length > 0) {
          const targetState = question.targets[0]; // 'interests', 'usual_behavior', etc.
          
          if (states[targetState]) {
            // Higher answer = stronger alignment with the question's implied color
            // Questions are designed to indicate specific color tendencies
            this.updateStateFromAnswer(states[targetState], question, answer);
          }
        }
      });

      // Normalize each state to 100%
      Object.keys(states).forEach(stateName => {
        const state = states[stateName];
        const total = Object.values(state).reduce((a, b) => a + b, 0);
        if (total > 0) {
          Object.keys(state).forEach(color => {
            state[color] = Math.round((state[color] / total) * 100);
          });
        }

        // Ensure sums to exactly 100
        const sum = Object.values(state).reduce((a, b) => a + b, 0);
        if (sum !== 100) {
          const diff = 100 - sum;
          const maxColor = Object.entries(state).sort(([, a], [, b]) => b - a)[0][0];
          state[maxColor] += diff;
        }
      });

      logger.info('birkman', 'Internal states calculated successfully');
      return states;
    } catch (error) {
      logger.error('birkman', 'Error calculating internal states', { error: error.message });
      // Return default balanced states
      return {
        interests: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        usual_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        needs: { Red: 25, Green: 25, Yellow: 25, Blue: 25 },
        stress_behavior: { Red: 25, Green: 25, Yellow: 25, Blue: 25 }
      };
    }
  }

  /**
   * Update state color scores based on a question answer
   * @param {Object} state - The state object to update
   * @param {Object} question - The question
   * @param {Number} answer - The answer (1-5)
   */
  updateStateFromAnswer(state, question, answer) {
    // Map question context to likely color alignment
    // This is a simplified heuristic - in production, questions would have explicit color mappings
    
    // Questions 135 & 139 are about interests
    if (question.id === 135) {
      // "Activities involve working with people" -> Yellow/Blue
      state.Yellow += answer * 3;
      state.Blue += answer * 2;
    } else if (question.id === 139) {
      // "Analytical, detail-oriented work" -> Green
      state.Green += answer * 4;
    }
    // Questions 136 & 140 are about behavior
    else if (question.id === 136) {
      // "Fast-paced, results-driven" -> Red
      state.Red += answer * 4;
    } else if (question.id === 140) {
      // "Become more directive under stress" -> Red
      state.Red += answer * 4;
    }
    // Question 137 is about needs
    else if (question.id === 137) {
      // "Need autonomy and control" -> Red/Green
      state.Red += answer * 2;
      state.Green += answer * 2;
    }
    // Question 138 is about stress behavior
    else if (question.id === 138) {
      // "Withdrawn when needs unmet" -> Blue
      state.Blue += answer * 4;
    }
  }

  /**
   * Calculate 9 component scores from answers
   * @param {Object} answers - User answers
   * @param {Array} questions - All questions
   * @param {Object} dimensionScores - Existing dimension scores
   * @returns {Object} - {social_energy, physical_energy, ...} 9 components
   */
  calculateComponents(answers, questions, dimensionScores) {
    try {
      logger.info('birkman', 'Calculating 9 components');

      // Map existing dimensions to components as baseline
      const components = {
        social_energy: dimensionScores.sociability_usual || 50,
        physical_energy: 50, // New component, calculated from upgrade questions
        emotional_energy: dimensionScores.emotional_intelligence_usual || 50,
        self_consciousness: 50 - (dimensionScores.assertiveness_usual || 50) * 0.5, // Inverse relationship
        assertiveness: dimensionScores.assertiveness_usual || 50,
        insistence: 50 + (dimensionScores.conscientiousness_usual || 50) * 0.3,
        incentives: 50, // New component
        restlessness: dimensionScores.flexibility_usual || 50,
        thought: dimensionScores.theoretical_orientation_usual || 50
      };

      // Enhance with upgrade question answers if available
      const componentQuestions = questions.filter(
        q => q.dimension === 'component_focus' && q.context === 'upgrade'
      );

      componentQuestions.forEach(question => {
        const answer = answers[question.id];
        if (answer !== undefined && answer !== null && question.targets && question.targets.length > 0) {
          const component = question.targets[0];
          if (components[component] !== undefined) {
            // Blend the upgrade answer with the existing score
            const answerScore = ((answer - 1) / 4) * 100; // Convert 1-5 to 0-100
            components[component] = Math.round((components[component] * 0.6) + (answerScore * 0.4));
          }
        }
      });

      // Ensure all scores are in 0-100 range
      Object.keys(components).forEach(key => {
        components[key] = Math.max(0, Math.min(100, Math.round(components[key])));
      });

      logger.info('birkman', '9 components calculated successfully');
      return components;
    } catch (error) {
      logger.error('birkman', 'Error calculating components', { error: error.message });
      // Return default mid-range scores
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
   * Calculate components specifically from upgrade answers
   * Used when upgrading a v2 assessment
   * @param {Object} upgradeAnswers - Answers to upgrade questions
   * @param {Array} upgradeQuestions - The upgrade questions
   * @returns {Object} - Components scores
   */
  calculateComponentsFromUpgradeAnswers(upgradeAnswers, upgradeQuestions) {
    try {
      logger.info('birkman', 'Calculating components from upgrade answers');

      const components = {
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

      const componentQuestions = upgradeQuestions.filter(
        q => q.dimension === 'component_focus' && q.context === 'upgrade'
      );

      componentQuestions.forEach(question => {
        const answer = upgradeAnswers[question.id];
        if (answer !== undefined && answer !== null && question.targets && question.targets.length > 0) {
          const component = question.targets[0];
          if (components[component] !== undefined) {
            // Direct mapping from answer to score
            components[component] = Math.round(((answer - 1) / 4) * 100);
          }
        }
      });

      logger.info('birkman', 'Components from upgrade calculated successfully');
      return components;
    } catch (error) {
      logger.error('birkman', 'Error calculating components from upgrade', { error: error.message });
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
   * Get color name from spectrum (returns primary color)
   * @param {Object} spectrum - {Red, Green, Yellow, Blue}
   * @returns {String} - Color name
   */
  getColorName(spectrum) {
    const sorted = Object.entries(spectrum).sort(([, a], [, b]) => b - a);
    return sorted[0][0];
  }

  /**
   * Get full color description
   * @param {String} colorName - 'Red', 'Green', 'Yellow', or 'Blue'
   * @returns {Object} - Full color definition
   */
  getColorDescription(colorName) {
    return this.colors.find(c => c.name === colorName) || this.colors[0];
  }

  /**
   * Validate Birkman data structure
   * @param {Object} data - Data to validate
   * @returns {Boolean} - True if valid
   */
  validateBirkmanData(data) {
    try {
      if (!data) return false;

      // Check for required fields
      if (!data.birkman_color || !data.birkman_color.primary || !data.birkman_color.spectrum) {
        return false;
      }

      // Check components
      if (!data.components || typeof data.components !== 'object') {
        return false;
      }

      const requiredComponents = [
        'social_energy', 'physical_energy', 'emotional_energy', 'self_consciousness',
        'assertiveness', 'insistence', 'incentives', 'restlessness', 'thought'
      ];

      for (const comp of requiredComponents) {
        if (data.components[comp] === undefined) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('birkman', 'Error validating Birkman data', { error: error.message });
      return false;
    }
  }
}

const birkmanMappingService = new BirkmanMappingService();
export default birkmanMappingService;
