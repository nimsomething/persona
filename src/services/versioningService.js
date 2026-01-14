import logger from './loggerService';
import { calculateComponentsFromUpgradeAnswers, calculateBirkmanColor, calculateBirkmanStates } from './personalityService';
import { APP_VERSION } from './appService';

// --- Private Helper Functions ---

function _hasLegacyData(assessment) {
    if (!assessment || !assessment.results) {
        return false;
    }
    const { results, version = '2.x' } = assessment;
    if (!['2.x', '3.0.0'].some(legacy => version.startsWith('3.0.0') || version.startsWith('2.'))) {
        return false;
    }
    if (results.scores && typeof results.scores === 'object') {
        for (const [key, value] of Object.entries(results.scores)) {
            if (typeof value === 'object' && !Array.isArray(value) && (key === 'values_profile' || key === 'work_style_profile')) {
                return true;
            }
        }
    }
    return false;
}

function _migrateSingleAssessment(assessment) {
    const migrated = { ...assessment, version: APP_VERSION, migratedFrom: assessment.version, migratedAt: new Date().toISOString(), results: { ...assessment.results } };
    if (migrated.results.scores) {
        const { scores, ...extracted } = _extractNestedObjects(migrated.results.scores);
        migrated.results.scores = scores;
        Object.assign(migrated.results, extracted);
    }
    migrated.dimensionScores = migrated.results.scores;
    if (migrated.results.values_profile) {
        migrated.values_profile = migrated.results.values_profile;
    }
    if (migrated.results.work_style_profile) {
        migrated.work_style_profile = migrated.results.work_style_profile;
    }
    return migrated;
}

function _extractNestedObjects(scoresWithNesting) {
    const extractedData = {};
    const cleanScores = {};
    for (const [key, value] of Object.entries(scoresWithNesting)) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            extractedData[key] = value;
        } else if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
            cleanScores[key] = value;
        }
    }
    return { scores: cleanScores, ...extractedData };
}

function _blendComponentScores(v2Results, upgradeComponents) {
    const { dimensions } = v2Results;
    const blended = { ...upgradeComponents };

    if (dimensions.sociability_usual !== undefined) {
        blended.social_energy = Math.round((blended.social_energy * 0.5) + (dimensions.sociability_usual * 0.5));
    }
    if (dimensions.emotional_intelligence_usual !== undefined) {
        blended.emotional_energy = Math.round((blended.emotional_energy * 0.5) + (dimensions.emotional_intelligence_usual * 0.5));
    }
    if (dimensions.assertiveness_usual !== undefined) {
        blended.assertiveness = Math.round((blended.assertiveness * 0.4) + (dimensions.assertiveness_usual * 0.6));
        blended.self_consciousness = Math.round((blended.self_consciousness * 0.6) + ((100 - dimensions.assertiveness_usual) * 0.4));
    }
    if (dimensions.conscientiousness_usual !== undefined) {
        blended.insistence = Math.round((blended.insistence * 0.6) + (dimensions.conscientiousness_usual * 0.4));
    }
    if (dimensions.flexibility_usual !== undefined) {
        blended.restlessness = Math.round((blended.restlessness * 0.5) + (dimensions.flexibility_usual * 0.5));
    }
    if (dimensions.theoretical_orientation_usual !== undefined) {
        blended.thought = Math.round((blended.thought * 0.4) + (dimensions.theoretical_orientation_usual * 0.6));
    }

    Object.keys(blended).forEach(key => {
        blended[key] = Math.max(0, Math.min(100, blended[key]));
    });
    return blended;
}

// --- Public API ---

export function migrateAssessments(assessments) {
    const migrationStats = { total: assessments.length, migrated: 0, failed: 0, skipped: 0 };
    const migratedAssessments = assessments.map(assessment => {
        if (!_hasLegacyData(assessment)) {
            migrationStats.skipped++;
            return assessment;
        }
        try {
            const migrated = _migrateSingleAssessment(assessment);
            migrationStats.migrated++;
            return migrated;
        } catch (error) {
            migrationStats.failed++;
            logger.error('Migration failed for assessment', { assessmentId: assessment.id, error: error.message }, 'upgrade');
            return assessment;
        }
    });
    return { migratedAssessments, migrationStats };
}

export function canUpgradeAssessment(assessment) {
    if (!assessment || !assessment.version) return false;
    const isV2 = assessment.version.startsWith('2.');
    const notUpgraded = !assessment.upgradedFrom;
    return isV2 && notUpgraded;
}

export function upgradeV2toV3(v2Assessment, upgradeAnswers, upgradeQuestions) {
    if (!canUpgradeAssessment(v2Assessment)) {
        throw new Error('Assessment cannot be upgraded');
    }

    const v2Results = {
        dimensions: v2Assessment.dimensionScores || v2Assessment.scores || {},
        archetype: v2Assessment.archetype,
        mbtiType: v2Assessment.mbtiType,
        values_profile: v2Assessment.values_profile,
        work_style_profile: v2Assessment.work_style_profile
    };

    const upgradeComponents = calculateComponentsFromUpgradeAnswers(upgradeAnswers, upgradeQuestions);
    const blendedComponents = _blendComponentScores(v2Results, upgradeComponents);
    const birkmanColor = calculateBirkmanColor(v2Results.dimensions);
    const birkmanStates = calculateBirkmanStates(upgradeAnswers, upgradeQuestions);

    return {
        ...v2Results,
        components: blendedComponents,
        birkman_color: birkmanColor,
        birkman_states: birkmanStates,
        version: APP_VERSION,
        upgradedFrom: v2Assessment.version,
        originalCompletedAt: v2Assessment.completedAt,
        upgradedAt: new Date().toISOString()
    };
}

export function getUpgradeStatus(assessment) {
    if (!assessment) {
        return { isV2: false, isV3: false, isUpgraded: false, version: null };
    }
    const isV2 = assessment.version?.startsWith('2.');
    const isV3 = assessment.version?.startsWith('3.');
    const isUpgraded = !!assessment.upgradedFrom;
    return { isV2, isV3, isUpgraded, version: assessment.version };
}
