import logger from './loggerService';
import birkmanMappingService from './birkmanMappingService';
import { calculateDimensionScores } from '../utils/scoring';

class UpgradeService {
  /**
   * Check if an assessment can be upgraded from v2 to v3
   * @param {Object} assessment - The assessment to check
   * @returns {Boolean}
   */
  canUpgradeAssessment(assessment) {
    try {
      if (!assessment || !assessment.version) return false;

      // Check if it's a v2 assessment
      const isV2 = assessment.version.startsWith('2.');

      // Check if it hasn't already been upgraded
      const notUpgraded = !assessment.upgradedFrom;

      const canUpgrade = isV2 && notUpgraded;

      logger.info('upgrade', `Assessment upgrade check: version=${assessment.version}, canUpgrade=${canUpgrade}`);

      return canUpgrade;
    } catch (error) {
      logger.error('upgrade', 'Error checking upgrade eligibility', { error: error.message });
      return false;
    }
  }

  /**
   * Upgrade a v2 assessment to v3 by blending with upgrade answers
   * @param {Object} v2Assessment - The original v2 assessment
   * @param {Object} upgradeAnswers - Answers to the 20 upgrade questions
   * @param {Array} upgradeQuestions - The upgrade questions
   * @returns {Object} - Upgraded assessment results
   */
  upgradeV2toV3(v2Assessment, upgradeAnswers, upgradeQuestions) {
    try {
      logger.info('upgrade', 'Starting v2 to v3 upgrade');

      if (!this.canUpgradeAssessment(v2Assessment)) {
        throw new Error('Assessment cannot be upgraded');
      }

      // Preserve v2 dimension scores
      const v2Results = {
        dimensions: v2Assessment.dimensionScores || v2Assessment.scores || {},
        archetype: v2Assessment.archetype,
        mbtiType: v2Assessment.mbtiType,
        values_profile: v2Assessment.values_profile,
        work_style_profile: v2Assessment.work_style_profile
      };

      // Calculate components from upgrade answers
      const upgradeComponents = birkmanMappingService.calculateComponentsFromUpgradeAnswers(
        upgradeAnswers,
        upgradeQuestions
      );

      // Blend components with v2 dimensions
      const blendedComponents = this.blendComponentScores(v2Results, upgradeComponents);

      // Calculate Birkman color from v2 dimensions
      const birkmanColor = birkmanMappingService.calculateBirkmanColor(
        v2Results.dimensions,
        null
      );

      // Calculate internal states from upgrade answers
      const birkmanStates = birkmanMappingService.calculateInternalStates(
        upgradeAnswers,
        upgradeQuestions
      );

      // Build upgraded results
      const upgradedResults = {
        // Preserve all v2 data
        ...v2Results,
        
        // Add v3 enhancements
        components: blendedComponents,
        birkman_color: birkmanColor,
        birkman_states: birkmanStates,
        
        // Metadata
        version: '3.0.0',
        upgradedFrom: v2Assessment.version,
        originalCompletedAt: v2Assessment.completedAt,
        upgradedAt: new Date().toISOString()
      };

      logger.info('upgrade', 'v2 to v3 upgrade completed successfully');

      return upgradedResults;
    } catch (error) {
      logger.error('upgrade', 'Error upgrading assessment', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Blend v2 dimension scores with upgrade component scores
   * @param {Object} v2Results - v2 assessment results
   * @param {Object} upgradeComponents - Component scores from upgrade questions
   * @returns {Object} - Blended component scores
   */
  blendComponentScores(v2Results, upgradeComponents) {
    try {
      logger.info('upgrade', 'Blending component scores');

      const dimensions = v2Results.dimensions;

      // Start with upgrade components as base
      const blended = { ...upgradeComponents };

      // Enhance with v2 dimension data where applicable
      // Social energy: blend with sociability
      if (dimensions.sociability_usual !== undefined) {
        blended.social_energy = Math.round(
          (blended.social_energy * 0.5) + (dimensions.sociability_usual * 0.5)
        );
      }

      // Emotional energy: blend with emotional intelligence
      if (dimensions.emotional_intelligence_usual !== undefined) {
        blended.emotional_energy = Math.round(
          (blended.emotional_energy * 0.5) + (dimensions.emotional_intelligence_usual * 0.5)
        );
      }

      // Assertiveness: use v2 assertiveness as strong signal
      if (dimensions.assertiveness_usual !== undefined) {
        blended.assertiveness = Math.round(
          (blended.assertiveness * 0.4) + (dimensions.assertiveness_usual * 0.6)
        );
      }

      // Self-consciousness: inverse relationship with assertiveness
      if (dimensions.assertiveness_usual !== undefined) {
        const inverseAssertiveness = 100 - dimensions.assertiveness_usual;
        blended.self_consciousness = Math.round(
          (blended.self_consciousness * 0.6) + (inverseAssertiveness * 0.4)
        );
      }

      // Insistence: relate to conscientiousness
      if (dimensions.conscientiousness_usual !== undefined) {
        blended.insistence = Math.round(
          (blended.insistence * 0.6) + (dimensions.conscientiousness_usual * 0.4)
        );
      }

      // Restlessness: relate to flexibility
      if (dimensions.flexibility_usual !== undefined) {
        blended.restlessness = Math.round(
          (blended.restlessness * 0.5) + (dimensions.flexibility_usual * 0.5)
        );
      }

      // Thought: use theoretical orientation
      if (dimensions.theoretical_orientation_usual !== undefined) {
        blended.thought = Math.round(
          (blended.thought * 0.4) + (dimensions.theoretical_orientation_usual * 0.6)
        );
      }

      // Ensure all scores are in 0-100 range
      Object.keys(blended).forEach(key => {
        blended[key] = Math.max(0, Math.min(100, blended[key]));
      });

      logger.info('upgrade', 'Component scores blended successfully');

      return blended;
    } catch (error) {
      logger.error('upgrade', 'Error blending component scores', { error: error.message });
      return upgradeComponents; // Fallback to upgrade components only
    }
  }

  /**
   * Get upgrade status for an assessment
   * @param {Object} assessment - The assessment
   * @returns {Object} - {isV2, isUpgraded, originalDate, upgradedDate, version}
   */
  getUpgradeStatus(assessment) {
    if (!assessment) {
      return {
        isV2: false,
        isV3: false,
        isUpgraded: false,
        originalDate: null,
        upgradedDate: null,
        version: null
      };
    }

    const isV2 = assessment.version?.startsWith('2.');
    const isV3 = assessment.version?.startsWith('3.');
    const isUpgraded = !!assessment.upgradedFrom;

    return {
      isV2,
      isV3,
      isUpgraded,
      originalDate: assessment.originalCompletedAt || assessment.completedAt || null,
      upgradedDate: assessment.upgradedAt || null,
      version: assessment.version || null,
      upgradedFrom: assessment.upgradedFrom || null
    };
  }
}

const upgradeService = new UpgradeService();
export default upgradeService;
