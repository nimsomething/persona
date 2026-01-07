const STORAGE_KEY = 'personality_assessment_v2';
const SESSION_KEY = 'assessment_session';

class StorageService {
  constructor() {
    this.isAvailable = this.checkStorageAvailability();
  }

  checkStorageAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
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
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (e) {
      console.error('Failed to save session:', e);
      return null;
    }
  }

  getExistingSession() {
    if (!this.isAvailable) return null;

    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to retrieve session:', e);
      return null;
    }
  }

  clearSession() {
    if (!this.isAvailable) return;
    localStorage.removeItem(SESSION_KEY);
  }

  saveCompletedAssessment(userName, results) {
    if (!this.isAvailable) return null;

    const completedAssessment = {
      id: this.generateSessionId(),
      userName,
      results,
      completedAt: new Date().toISOString(),
      version: '2.0'
    };

    try {
      const existing = this.getCompletedAssessments();
      existing.unshift(completedAssessment);
      
      // Keep only the last 5 completed assessments
      const trimmed = existing.slice(0, 5);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      this.clearSession();
      return completedAssessment;
    } catch (e) {
      console.error('Failed to save completed assessment:', e);
      return null;
    }
  }

  getCompletedAssessments() {
    if (!this.isAvailable) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to retrieve completed assessments:', e);
      return [];
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
    const session = this.getExistingSession();
    if (!session) return null;

    // Check if session is older than 7 days
    const sessionAge = Date.now() - new Date(session.startedAt).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (sessionAge > sevenDays) {
      this.clearSession();
      return null;
    }

    return session;
  }
}

export default new StorageService();