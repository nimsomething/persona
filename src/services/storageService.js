import logger from './loggerService.js';
import questionsData from '../data/questions.json';
import {
  calculateDimensionScores,
  determineArchetype,
  calculateStressDeltas,
  calculateAdaptabilityScore,
  isValidScores,
  isValidComponents,
  isValidBirkmanColor,
  isValidBirkmanStates,
  isValidNumericObject,
  diagnoseScoresIssues
} from '../utils/scoring.js';
import { APP_VERSION, isV3Assessment } from '../utils/appMeta.js';

const STORAGE_KEY = 'personality_assessment_v2';
const SESSION_KEY = 'assessment_session';

class StorageService {
  constructor() {
    this.isAvailable = this.checkStorageAvailability();
    logger.info('Storage service initialized', { isAvailable: this.isAvailable }, 'storage');
  }

  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      logger.error('localStorage not available', { error: e.message }, 'storage');
      return false;
    }
  }

  saveSession(userName, currentQuestion, responses) {
    if (!this.isAvailable) return null;

    const session = {
      sessionId: this.generateSessionId(),
      userName,
      currentQuestion,
      responses,
      lastUpdated: new Date().toISOString(),
      startedAt: this.getExistingSession()?.startedAt || new Date().toISOString()
    };

    try {
      const sessionData = JSON.stringify(session);
      localStorage.setItem(SESSION_KEY, sessionData);
      logger.logStorageOperation('save', SESSION_KEY, sessionData.length, true);
      logger.debug('Session saved', {
        userName,
        questionIndex: currentQuestion,
        answersCount: Object.keys(responses).length
      }, 'storage');
      return session;
    } catch (e) {
      logger.logStorageOperation('save', SESSION_KEY, 0, false, e);
      logger.error('Failed to save session', {
        userName,
        error: e.message,
        isQuotaExceeded: e.name === 'QuotaExceededError'
      }, 'storage');
      return null;
    }
  }

  getExistingSession() {
    if (!this.isAvailable) return null;

    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        logger.debug('Session retrieved', {
          userName: session.userName,
          questionIndex: session.currentQuestion,
          answersCount: Object.keys(session.responses || {}).length,
          lastUpdated: session.lastUpdated
        }, 'storage');
        return session;
      }
      logger.debug('No existing session found', {}, 'storage');
      return null;
    } catch (e) {
      logger.error('Failed to retrieve session', { error: e.message }, 'storage');
      return null;
    }
  }

  clearSession() {
    if (!this.isAvailable) return;
    localStorage.removeItem(SESSION_KEY);
    logger.info('Session cleared', {}, 'storage');
  }

  saveCompletedAssessment(userName, results, version = APP_VERSION) {
    if (!this.isAvailable) return null;

    const completedAssessment = {
      id: this.generateSessionId(),
      userName,
      results,
      completedAt: new Date().toISOString(),
      version: version,
      // v3 fields
      dimensionScores: results.dimensions || results.dimensionScores,
      archetype: results.archetype,
      mbtiType: results.mbtiType,
      values_profile: results.values_profile,
      work_style_profile: results.work_style_profile,
      // v3 enhancements
      birkman_color: results.birkman_color,
      components: results.components,
      birkman_states: results.birkman_states,
      // Upgrade metadata
      upgradedFrom: results.upgradedFrom,
      originalCompletedAt: results.originalCompletedAt,
      upgradedAt: results.upgradedAt
    };

    try {
      const existing = this.getCompletedAssessments();
      existing.unshift(completedAssessment);

      // Keep only the last 5 completed assessments
      const trimmed = existing.slice(0, 5);

      const data = JSON.stringify(trimmed);
      localStorage.setItem(STORAGE_KEY, data);
      logger.logStorageOperation('save', STORAGE_KEY, data.length, true);
      logger.info('Completed assessment saved', {
        userName,
        assessmentId: completedAssessment.id,
        version: version,
        archetype: results?.archetype?.name,
        totalAssessments: trimmed.length,
        isUpgraded: !!results.upgradedFrom
      }, 'storage');
      this.clearSession();
      return completedAssessment;
    } catch (e) {
      logger.logStorageOperation('save', STORAGE_KEY, 0, false, e);
      logger.error('Failed to save completed assessment', {
        userName,
        error: e.message,
        isQuotaExceeded: e.name === 'QuotaExceededError'
      }, 'storage');
      return null;
    }
  }

  /**
   * Upgrade a v2 assessment to v3
   * @param {Object} v2Assessment - The v2 assessment to upgrade
   * @param {Object} upgradeAnswers - Answers to upgrade questions
   * @param {Object} blendedResults - The blended v3 results
   * @returns {Object} - The upgraded assessment
   */
  upgradeAssessmentFromV2(v2Assessment, upgradeAnswers, blendedResults) {
    if (!this.isAvailable) return null;

    try {
      // Create upgraded assessment
      const upgradedAssessment = {
        ...v2Assessment,
        version: APP_VERSION,
        upgradedFrom: v2Assessment.version,
        originalCompletedAt: v2Assessment.completedAt,
        upgradedAt: new Date().toISOString(),
        // Update results with v3 data
        results: blendedResults,
        // v3 fields at top level
        dimensionScores: blendedResults.dimensions,
        birkman_color: blendedResults.birkman_color,
        components: blendedResults.components,
        birkman_states: blendedResults.birkman_states
      };

      // Replace the v2 assessment in storage
      const existing = this.getCompletedAssessments();
      const index = existing.findIndex(a => a.id === v2Assessment.id);
      
      if (index !== -1) {
        existing[index] = upgradedAssessment;
      } else {
        existing.unshift(upgradedAssessment);
      }

      // Keep only the last 5 completed assessments
      const trimmed = existing.slice(0, 5);

      const data = JSON.stringify(trimmed);
      localStorage.setItem(STORAGE_KEY, data);
      logger.logStorageOperation('upgrade', STORAGE_KEY, data.length, true);
      logger.info('Assessment upgraded from v2 to v3', {
        userName: upgradedAssessment.userName,
        assessmentId: upgradedAssessment.id,
        originalVersion: v2Assessment.version,
        newVersion: APP_VERSION
      }, 'storage');

      return upgradedAssessment;
    } catch (e) {
      logger.error('Failed to upgrade assessment', {
        error: e.message,
        assessmentId: v2Assessment.id
      }, 'storage');
      return null;
    }
  }

  /**
   * Load completed assessments and attempt automatic recovery for corrupted/empty score data.
   *
   * This is intended to run on app load after version upgrades.
   */
  async loadCompletedAssessments() {
    if (!this.isAvailable) return [];

    const assessments = this.getCompletedAssessments();
    if (!Array.isArray(assessments) || assessments.length === 0) {
      return Array.isArray(assessments) ? assessments : [];
    }

    try {
      const { updatedAssessments, recoveryStats, didChange } = await logger.measureAsyncOperation(
        'Completed assessment score recovery',
        async () => {
          const stats = {
            totalAssessments: assessments.length,
            patchedFromExistingScores: 0,
            recalculatedFromAnswers: 0,
            skipped: 0,
            failed: 0
          };

          let changed = false;

          const updated = assessments.map((assessment) => {
            try {
              const recovery = this.recoverAssessmentScoresIfNeeded(assessment);

              if (recovery.changed) {
                changed = true;
                if (recovery.action === 'patched') stats.patchedFromExistingScores++;
                if (recovery.action === 'recalculated') stats.recalculatedFromAnswers++;
              } else {
                stats.skipped++;
              }

              return recovery.assessment;
            } catch (error) {
              stats.failed++;
              logger.error('Failed to recover assessment scores', {
                assessmentId: assessment?.id,
                userName: assessment?.userName,
                error: error.message
              }, 'storage');
              return assessment;
            }
          });

          return { updatedAssessments: updated, recoveryStats: stats, didChange: changed };
        },
        'storage'
      );

      if (didChange) {
        this.persistCompletedAssessments(updatedAssessments, {
          operation: 'scoreRecovery',
          ...recoveryStats
        });

        logger.info('Completed assessment scores recovered on load', recoveryStats, 'storage');
      }

      return updatedAssessments;
    } catch (error) {
      logger.error('Completed assessment score recovery failed', { error: error.message }, 'storage');
      return assessments;
    }
  }

  persistCompletedAssessments(assessments, context = {}) {
    if (!this.isAvailable) return false;

    try {
      const trimmed = Array.isArray(assessments) ? assessments.slice(0, 5) : [];
      const data = JSON.stringify(trimmed);
      localStorage.setItem(STORAGE_KEY, data);
      logger.logStorageOperation('save', STORAGE_KEY, data.length, true);
      logger.info('Completed assessments persisted', {
        totalAssessments: trimmed.length,
        ...context
      }, 'storage');
      return true;
    } catch (e) {
      logger.logStorageOperation('save', STORAGE_KEY, 0, false, e);
      logger.error('Failed to persist completed assessments', { error: e.message }, 'storage');
      return false;
    }
  }

  recoverAssessmentScoresIfNeeded(assessment) {
    const expectedV3 = this.isAssessmentExpectedV3(assessment);

    const bestCandidate = this.findBestScoresCandidate(assessment, expectedV3);
    const resultsCandidate = this.evaluateScoresCandidate(
      assessment?.results?.dimensions || assessment?.results?.scores,
      expectedV3
    );

    const needsRecovery =
      resultsCandidate.needsRecovery ||
      !resultsCandidate.isValid ||
      !bestCandidate ||
      bestCandidate.needsRecovery ||
      !bestCandidate.isValid;

    if (!needsRecovery) {
      return { assessment, changed: false, action: 'skipped' };
    }

    // Prefer a full recalculation if we have raw answers available.
    const rawAnswers = this.getRawAnswersFromAssessment(assessment);
    if (rawAnswers) {
      const recalculated = this.recalculateResultsFromAnswers(rawAnswers, expectedV3);

      if (recalculated) {
        const updated = this.applyRecoveredResultsToAssessment(assessment, recalculated, {
          method: 'recalculatedFromAnswers',
          recoveredByVersion: APP_VERSION
        }, expectedV3);

        return { assessment: updated, changed: true, action: 'recalculated' };
      }
    }

    // Fallback: hydrate results with the best available existing score data, even if partial.
    const bestCoreCount = bestCandidate?.diagnosis?.metadata?.validCoreDimensions || 0;
    if (bestCandidate?.rawScores && bestCoreCount > 0) {
      const hydratedScores = this.hydrateScoresWithKnownFields(bestCandidate.rawScores, assessment);
      const updated = this.applyRecoveredScoresToAssessment(assessment, hydratedScores, {
        method: 'patchedFromExistingScores',
        recoveredByVersion: APP_VERSION
      });

      return { assessment: updated, changed: true, action: 'patched' };
    }

    logger.warn('Scores invalid but no recovery path succeeded', {
      assessmentId: assessment?.id,
      userName: assessment?.userName,
      version: assessment?.version,
      bestCandidateSource: bestCandidate?.source,
      hasRawAnswers: !!rawAnswers
    }, 'storage');

    return { assessment, changed: false, action: 'skipped' };
  }

  isAssessmentExpectedV3(assessment) {
    const version = assessment?.version;
    if (typeof version === 'string') {
      return isV3Assessment(version);
    }

    return !!assessment?.results?.components || !!assessment?.components;
  }

  filterPrimitiveScores(scores) {
    if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return {};

    const primitiveScores = {};
    Object.entries(scores).forEach(([key, value]) => {
      if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
        primitiveScores[key] = value;
      }
    });

    return primitiveScores;
  }

  evaluateScoresCandidate(scores, expectedV3) {
    const primitiveScores = this.filterPrimitiveScores(scores);
    const diagnosis = diagnoseScoresIssues(primitiveScores, expectedV3);

    const missingCore = diagnosis?.metadata?.missingCoreDimensions?.length || 0;
    const missingStress = diagnosis?.metadata?.missingStressDimensions?.length || 0;

    const needsRecovery =
      !diagnosis.isValid ||
      Object.keys(primitiveScores).length === 0 ||
      missingCore > 0 ||
      (expectedV3 && missingStress > 0);

    return {
      primitiveScores,
      diagnosis,
      isValid: diagnosis.isValid && isValidScores(primitiveScores) && missingCore === 0,
      needsRecovery
    };
  }

  findBestScoresCandidate(assessment, expectedV3) {
    const candidates = [
      { source: 'results.dimensions', scores: assessment?.results?.dimensions },
      { source: 'results.scores', scores: assessment?.results?.scores },
      { source: 'dimensionScores', scores: assessment?.dimensionScores },
      { source: 'scores', scores: assessment?.scores }
    ];

    let best = null;

    candidates.forEach(({ source, scores }) => {
      if (!scores) return;

      const evaluation = this.evaluateScoresCandidate(scores, expectedV3);
      const validCore = evaluation.diagnosis?.metadata?.validCoreDimensions || 0;
      const stressFound = evaluation.diagnosis?.metadata?.stressDimensionsFound || 0;
      const keyCount = evaluation.diagnosis?.metadata?.keyCount || Object.keys(evaluation.primitiveScores).length;

      // A simple ranking that favors valid+complete candidates.
      const rank =
        (evaluation.isValid ? 100000 : 0) +
        validCore * 1000 +
        stressFound * 50 +
        keyCount;

      if (!best || rank > best.rank) {
        best = {
          source,
          rawScores: scores,
          ...evaluation,
          rank
        };
      }
    });

    return best;
  }

  hydrateScoresWithKnownFields(scores, assessment) {
    if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return scores;

    const hydrated = { ...scores };

    if (assessment?.values_profile && hydrated.values_profile === undefined) {
      hydrated.values_profile = assessment.values_profile;
    }
    if (assessment?.work_style_profile && hydrated.work_style_profile === undefined) {
      hydrated.work_style_profile = assessment.work_style_profile;
    }
    if (assessment?.components && hydrated.components === undefined) {
      hydrated.components = assessment.components;
    }
    if (assessment?.birkman_color && hydrated.birkman_color === undefined) {
      hydrated.birkman_color = assessment.birkman_color;
    }
    if (assessment?.birkman_states && hydrated.birkman_states === undefined) {
      hydrated.birkman_states = assessment.birkman_states;
    }

    return hydrated;
  }

  stripV3EnhancementsFromScores(scores) {
    if (!scores || typeof scores !== 'object' || Array.isArray(scores)) return scores;

    const stripped = { ...scores };
    delete stripped.components;
    delete stripped.birkman_color;
    delete stripped.birkman_states;
    return stripped;
  }

  getRawAnswersFromAssessment(assessment) {
    const candidates = [
      assessment?.answers,
      assessment?.responses,
      assessment?.rawAnswers,
      assessment?.results?.answers,
      assessment?.results?.responses,
      assessment?.results?.rawAnswers
    ];

    for (const candidate of candidates) {
      const normalized = this.normalizeAnswers(candidate);
      if (normalized) return normalized;
    }

    return null;
  }

  normalizeAnswers(candidate) {
    if (!candidate) return null;

    let answers = candidate;

    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers);
      } catch {
        return null;
      }
    }

    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return null;

    const keys = Object.keys(answers);
    if (keys.length === 0) return null;

    const hasNumeric = keys.some((key) => typeof answers[key] === 'number');
    return hasNumeric ? answers : null;
  }

  recalculateResultsFromAnswers(rawAnswers, expectedV3) {
    try {
      const scores = calculateDimensionScores(rawAnswers, questionsData);
      const archetype = determineArchetype(scores);
      const stressDeltas = calculateStressDeltas(scores);
      const adaptabilityScore = calculateAdaptabilityScore(stressDeltas);

      const primitiveScores = this.filterPrimitiveScores(scores);
      const diagnosis = diagnoseScoresIssues(primitiveScores, expectedV3);

      const scoresValid =
        isValidScores(primitiveScores) &&
        diagnosis.isValid &&
        (diagnosis?.metadata?.missingCoreDimensions?.length || 0) === 0 &&
        (!expectedV3 || (diagnosis?.metadata?.missingStressDimensions?.length || 0) === 0);

      if (!scoresValid) {
        logger.logValidationError('storage', 'scoreRecovery', diagnosis, {
          issue: 'Recalculated scores failed validation',
          keyCount: Object.keys(primitiveScores).length
        });
        return null;
      }

      const valuesValid = !scores.values_profile || isValidNumericObject(scores.values_profile);
      const workStyleValid = !scores.work_style_profile || isValidNumericObject(scores.work_style_profile);

      if (!valuesValid || !workStyleValid) {
        logger.warn('Recalculated assessment profiles failed validation', {
          valuesValid,
          workStyleValid
        }, 'storage');
      }

      const recoveredScores = expectedV3 ? scores : this.stripV3EnhancementsFromScores(scores);

      const v3Fields = expectedV3
        ? {
            components: scores.components,
            birkman_color: scores.birkman_color,
            birkman_states: scores.birkman_states
          }
        : {};

      if (expectedV3) {
        if (scores.components && !isValidComponents(scores.components)) {
          logger.warn('Recovered components did not validate, continuing with defaults', {
            assessmentComponentKeys: Object.keys(scores.components || {})
          }, 'storage');
        }

        if (scores.birkman_color && !isValidBirkmanColor(scores.birkman_color)) {
          logger.warn('Recovered birkman_color did not validate', { birkman_color: scores.birkman_color }, 'storage');
        }

        if (scores.birkman_states && !isValidBirkmanStates(scores.birkman_states)) {
          logger.warn('Recovered birkman_states did not validate', { stateKeys: Object.keys(scores.birkman_states || {}) }, 'storage');
        }
      }

      return {
        dimensions: recoveredScores,
        archetype,
        mbtiType: scores.mbtiType,
        values_profile: scores.values_profile,
        work_style_profile: scores.work_style_profile,
        stressDeltas,
        adaptabilityScore,
        ...v3Fields
      };
    } catch (error) {
      logger.error('Failed to recalculate scores from raw answers', { error: error.message }, 'storage');
      return null;
    }
  }

  applyRecoveredScoresToAssessment(assessment, scores, meta = {}) {
    const now = new Date().toISOString();

    const updated = {
      ...assessment,
      results: {
        ...(assessment?.results || {}),
        dimensions: scores,
        scores,
        recovered: true,
        previouslySaved: true,
        recoveredAt: now,
        ...meta
      },
      dimensionScores: scores,
      scoresRecoveredAt: now,
      scoresRecoveredByVersion: meta.recoveredByVersion || APP_VERSION
    };

    // Mirror known v3 fields for convenience.
    if (scores?.values_profile) updated.values_profile = scores.values_profile;
    if (scores?.work_style_profile) updated.work_style_profile = scores.work_style_profile;
    if (scores?.components) updated.components = scores.components;
    if (scores?.birkman_color) updated.birkman_color = scores.birkman_color;
    if (scores?.birkman_states) updated.birkman_states = scores.birkman_states;

    return updated;
  }

  applyRecoveredResultsToAssessment(assessment, recalculatedResults, meta = {}, expectedV3 = false) {
    const now = new Date().toISOString();

    const updatedResults = {
      ...(assessment?.results || {}),
      ...recalculatedResults,
      recovered: true,
      previouslySaved: true,
      recoveredAt: now,
      ...meta
    };

    const updated = {
      ...assessment,
      results: updatedResults,
      dimensionScores: recalculatedResults.dimensions,
      archetype: recalculatedResults.archetype,
      mbtiType: recalculatedResults.mbtiType,
      values_profile: recalculatedResults.values_profile,
      work_style_profile: recalculatedResults.work_style_profile,
      scoresRecoveredAt: now,
      scoresRecoveredByVersion: meta.recoveredByVersion || APP_VERSION
    };

    if (expectedV3) {
      updated.components = recalculatedResults.components;
      updated.birkman_color = recalculatedResults.birkman_color;
      updated.birkman_states = recalculatedResults.birkman_states;
    }

    return updated;
  }

  getCompletedAssessments() {
    if (!this.isAvailable) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const assessments = JSON.parse(stored);
        logger.debug('Completed assessments retrieved', {
          count: assessments.length,
          mostRecent: assessments[0]?.completedAt
        }, 'storage');
        return assessments;
      }
      logger.debug('No completed assessments found', {}, 'storage');
      return [];
    } catch (e) {
      logger.error('Failed to retrieve completed assessments', { error: e.message }, 'storage');
      return [];
    }
  }

  /**
   * Save migrated assessments after data migration
   * @param {Array} migratedAssessments - Migrated assessments array
   * @param {Object} migrationStats - Statistics about the migration
   * @returns {Boolean} - Success status
   */
  saveMigratedAssessments(migratedAssessments, migrationStats) {
    if (!this.isAvailable) return false;

    try {
      // Keep only the last 5 assessments as per existing limit
      const trimmed = migratedAssessments.slice(0, 5);
      
      const data = JSON.stringify(trimmed);
      localStorage.setItem(STORAGE_KEY, data);
      
      logger.logStorageOperation('save', 'migrated', data.length, true);
      logger.info('Migrated assessments saved', {
        totalProcessed: migrationStats.totalAssessments,
        legacyDetected: migrationStats.legacyDetected,
        successfulMigrations: migrationStats.migrationSuccess,
        failedMigrations: migrationStats.migrationFailed,
        skipped: migrationStats.skipped,
        totalAssessmentsAfterSave: trimmed.length
      }, 'storage');

      return true;
    } catch (e) {
      logger.logStorageOperation('save', 'migrated', 0, false, e);
      logger.error('Failed to save migrated assessments', {
        error: e.message,
        isQuotaExceeded: e.name === 'QuotaExceededError'
      }, 'storage');
      return false;
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auto-save functionality
  autoSave(userName, currentQuestion, responses) {
    // Throttle auto-saves to prevent excessive writes
    const now = Date.now();
    if (this.lastSaveTime && now - this.lastSaveTime < 2000) {
      return; // Don't save more than once every 2 seconds
    }
    this.lastSaveTime = now;

    this.saveSession(userName, currentQuestion, responses);
  }

  // Check if user wants to resume session
  shouldResumeSession() {
    try {
      const session = this.getExistingSession();
      if (!session) return null;

      // Check if session is older than 7 days
      const sessionAge = Date.now() - new Date(session.startedAt).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (sessionAge > sevenDays) {
        logger.info('Session expired (older than 7 days)', {
          userName: session.userName,
          sessionAge: `${Math.round(sessionAge / (1000 * 60 * 60))} hours`
        }, 'storage');
        this.clearSession();
        return null;
      }

      logger.info('Session available for recovery', {
        userName: session.userName,
        sessionAge: `${Math.round(sessionAge / (1000 * 60))} minutes`
      }, 'storage');

      return session;
    } catch (e) {
      logger.error('Failed to check resume session', { error: e.message }, 'storage');
      return null;
    }
  }
}

export default new StorageService();