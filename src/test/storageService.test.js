import storageService from '../services/storageService';
import { APP_VERSION } from '../utils/appMeta';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (i) => Object.keys(store)[i] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save raw answers with a completed assessment', () => {
    const userName = 'Test User';
    const results = {
      archetype: { name: 'Test Archetype' },
      scores: { assertiveness_usual: 50 },
    };
    const rawAnswers = { 'q1': 3, 'q2': 4 };

    storageService.saveCompletedAssessment(userName, results, rawAnswers);

    const savedData = JSON.parse(localStorage.getItem('personality_assessment_v2'));

    expect(savedData).toHaveLength(1);
    const savedAssessment = savedData[0];

    expect(savedAssessment.userName).toBe(userName);
    expect(savedAssessment.results).toEqual(results);
    expect(savedAssessment.rawAnswers).toEqual(rawAnswers);
    expect(savedAssessment.version).toBe(APP_VERSION);
  });
});
