/**
 * Data Migration Service for v3.0.1
 * 
 * Handles migration of legacy data formats (v3.0.0 and earlier) to v3.0.1 format
 * where nested objects were removed from the scores object to prevent React rendering errors.
 */

import logger from './loggerService.js';
import { 
  isValidScores, 
  isValidComponents, 
  isValidBirkmanColor, 
  isValidBirkmanStates,
  isValidNumericObject
} from '../utils/scoring.js';
import { APP_VERSION } from '../utils/appMeta.js';

class DataMigrationService {
  constructor() {
    this.LEGACY_VERSIONS = ['2.x', '3.0.0'];
    logger.info('Data migration service initialized', { targetVersion: APP_VERSION }, 'upgrade');
  }

  /**
   * Detect if an assessment has legacy format that needs migration
   * @param {Object} assessment - Assessment to check
   * @returns {Boolean} - True if legacy format detected
   */
  hasLegacyData(assessment) {
    if (!assessment || !assessment.results) {
      return false;
    }

    const results = assessment.results;
    const version = assessment.version || '2.x';

    // Only check v3.0.0 and below assessments
    if (!this.LEGACY_VERSIONS.some(legacy => version.startsWith('3.0.0') || isV2Assessment(version))) {
      return false;
    }

    // Check if results.scores contains nested objects (values_profile, work_style_profile)
    let hasNestedObjects = false;
    
    if (results.scores && typeof results.scores === 'object') {
      Object.entries(results.scores).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Found nested object in scores
          if (key === 'values_profile' || key === 'work_style_profile') {
            hasNestedObjects = true;
            logger.debug('Migration: Found nested object in scores', { key, version }, 'upgrade');
          }
        }
      });
    }

    return hasNestedObjects;
  }

  /**
   * Main migration function - migrates assessments to v3.0.1 format
   * @param {Array} assessments - Array of assessments to migrate
   * @returns {Object} - Object with { migratedAssessments, migrationStats }
   */
  migrateAssessmentsToV3_0_1(assessments) {
    const migrationStats = {
      totalAssessments: assessments.length,
      legacyDetected: 0,
      migrationSuccess: 0,
      migrationFailed: 0,
      skipped: 0
    };

    const migratedAssessments = assessments.map(assessment => {
      // Skip if already migrated or incompatible
      if (!this.hasLegacyData(assessment)) {
        migrationStats.skipped++;
        return assessment;
      }

      try {
        migrationStats.legacyDetected++;
        const migratedAssessment = this.migrateSingleAssessment(assessment);
        
        // Validate the migrated data
        if (!this.validateMigratedAssessment(migratedAssessment)) {
          migrationStats.migrationFailed++;
          logger.error('Migration validation failed for assessment', {
            assessmentId: assessment.id,
            userName: assessment.userName
          }, 'upgrade');
          return assessment; // Return original if validation fails
        }

        migrationStats.migrationSuccess++;
        logger.info('Assessment successfully migrated to v3.0.1', {
          assessmentId: migratedAssessment.id,
          userName: migratedAssessment.userName,
          fromVersion: assessment.version,
          toVersion: migratedAssessment.version
        }, 'upgrade');

        return migratedAssessment;
      } catch (error) {
        migrationStats.migrationFailed++;
        logger.error('Migration failed for assessment', {
          assessmentId: assessment.id,
          userName: assessment.userName,
          error: error.message,
          stack: error.stack
        }, 'upgrade');
        return assessment; // Return original on error
      }
    });

    return {
      migratedAssessments,
      migrationStats
    };
  }

  /**
   * Migrate a single assessment
   * @param {Object} assessment - Assessment to migrate
   * @returns {Object} - Migrated assessment
   */
  migrateSingleAssessment(assessment) {
    const migratedAssessment = {
      ...assessment,
      version: APP_VERSION,
      migratedFrom: assessment.version,
      migratedAt: new Date().toISOString(),
      results: { ...assessment.results }
    };

    // Extract nested objects from scores
    if (migratedAssessment.results.scores) {
      const { scores, ...extracted } = this.extractNestedObjects(migratedAssessment.results.scores);
      
      // Update scores to contain only primitives
      migratedAssessment.results.scores = scores;
      
      // Merge extracted data into results
      Object.assign(migratedAssessment.results, extracted);
    }

    // Ensure dimensionScores points to clean scores
    migratedAssessment.dimensionScores = migratedAssessment.results.scores;
    
    // Mirror extracted data at top level for consistency
    if (migratedAssessment.results.values_profile) {
      migratedAssessment.values_profile = migratedAssessment.results.values_profile;
    }
    if (migratedAssessment.results.work_style_profile) {
      migratedAssessment.work_style_profile = migratedAssessment.results.work_style_profile;
    }

    return migratedAssessment;
  }

  /**
   * Extract nested objects from scores and return clean scores + extracted data
   * @param {Object} scoresWithNesting - Scores with nested objects
   * @returns {Object} - Object with {scores: {...primitives}, ...extractedData}
   */
  extractNestedObjects(scoresWithNesting) {
    const extractedData = {};
    const cleanScores = {};

    Object.entries(scoresWithNesting).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        // This is a nested object - extract it
        extractedData[key] = value;
        logger.debug('Extracted nested object from scores', { key }, 'upgrade');
      } else if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
        // This is a primitive - keep it in scores
        cleanScores[key] = value;
      } else {
        // Skip other types (arrays, null, undefined)
        logger.warn('Skipping invalid score value', { key, type: typeof value }, 'upgrade');
      }
    });

    return {
      scores: cleanScores,
      ...extractedData
    };
  }

  /**
   * Validate migrated assessment structure
   * @param {Object} assessment - Migrated assessment to validate
   * @returns {Boolean} - True if valid
   */
  validateMigratedAssessment(assessment) {
    try {
      // Check scores are valid
      if (!isValidScores(assessment.results?.scores)) {
        logger.error('Migrated assessment has invalid scores', {}, 'upgrade');
        return false;
      }

      // Check components if present
      if (assessment.components && !isValidComponents(assessment.components)) {
        logger.error('Migrated assessment has invalid components', {}, 'upgrade');
        return false;
      }

      // Check birkman_color if present
      if (assessment.birkman_color && !isValidBirkmanColor(assessment.birkman_color)) {
        logger.error('Migrated assessment has invalid birkman_color', {}, 'upgrade');
        return false;
      }

      // Check birkman_states if present
      if (assessment.birkman_states && !isValidBirkmanStates(assessment.birkman_states)) {
        logger.error('Migrated assessment has invalid birkman_states', {}, 'upgrade');
        return false;
      }

      // Check values_profile if present
      if (assessment.values_profile && !isValidNumericObject(assessment.values_profile)) {
        logger.error('Migrated assessment has invalid values_profile', {}, 'upgrade');
        return false;
      }

      // Check work_style_profile if present
      if (assessment.work_style_profile && !isValidNumericObject(assessment.work_style_profile)) {
        logger.error('Migrated assessment has invalid work_style_profile', {}, 'upgrade');
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error during migration validation', { error: error.message }, 'upgrade');
      return false;
    }
  }
}

// Version checking utilities (imported from appMeta)
import { isV2Assessment } from '../utils/appMeta.js';

const dataMigrationService = new DataMigrationService();
export default dataMigrationService;

// Export functions for direct usage
export function migrateAssessmentsToV3_0_1(assessments) {
  return dataMigrationService.migrateAssessmentsToV3_0_1(assessments);
}

export function hasLegacyData(assessment) {
  return dataMigrationService.hasLegacyData(assessment);
}