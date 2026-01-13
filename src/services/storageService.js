import logger from './loggerService.js';

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

  saveCompletedAssessment(userName, results, version = '3.0.0') {
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
        version: '3.0.0',
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
        newVersion: '3.0.0'
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