
const CORE_DIMENSIONS = [
  'assertiveness',
  'sociability',
  'conscientiousness',
  'flexibility',
  'emotional_intelligence',
  'creativity',
  'risk_appetite',
  'theoretical_orientation',
];

export const diagnoseScoresIssues = (scores, isV3) => {
    const diagnosis = {
        isValid: true,
        issues: [],
        warnings: [],
        suggestion: 'Results appear to be valid.',
        nextSteps: [],
        metadata: {
            keyCount: 0,
            validCoreDimensions: 0,
            totalCoreDimensions: CORE_DIMENSIONS.length,
            missingCoreDimensions: [],
            stressDimensionsFound: 0,
            totalStressDimensions: CORE_DIMENSIONS.length,
            missingStressDimensions: [],
            isLikelyV2: !isV3,
        },
    };

    if (!scores || typeof scores !== 'object' || Array.isArray(scores)) {
        diagnosis.isValid = false;
        diagnosis.issues.push('Scores data is missing, not an object, or is an array.');
        diagnosis.suggestion = 'Assessment data is critically corrupted or missing. A new assessment is required.';
        diagnosis.metadata.keyCount = 0;
        return diagnosis;
    }

    diagnosis.metadata.keyCount = Object.keys(scores).length;

    // Check for core dimensions (_usual)
    CORE_DIMENSIONS.forEach(dim => {
        const key = `${dim}_usual`;
        if (typeof scores[key] === 'number' && scores[key] >= 0 && scores[key] <= 100) {
            diagnosis.metadata.validCoreDimensions++;
        } else {
            diagnosis.metadata.missingCoreDimensions.push(dim);
        }
    });

    if (diagnosis.metadata.missingCoreDimensions.length > 0) {
        diagnosis.isValid = false;
        diagnosis.issues.push(`Missing or invalid scores for ${diagnosis.metadata.missingCoreDimensions.length} core dimension(s): ${diagnosis.metadata.missingCoreDimensions.join(', ')}.`);
    }

    // If V3, check for stress dimensions
    if (isV3) {
        CORE_DIMENSIONS.forEach(dim => {
            const key = `${dim}_stress`;
            if (typeof scores[key] === 'number' && scores[key] >= 0 && scores[key] <= 100) {
                diagnosis.metadata.stressDimensionsFound++;
            } else {
                diagnosis.metadata.missingStressDimensions.push(dim);
            }
        });

        if (diagnosis.metadata.missingStressDimensions.length > 0) {
            // This is a warning, not an invalidation for now, as some v2->v3 might not have it.
            diagnosis.warnings.push(`Missing or invalid scores for ${diagnosis.metadata.missingStressDimensions.length} stress dimension(s): ${diagnosis.metadata.missingStressDimensions.join(', ')}. Some resilience metrics may be inaccurate.`);
        }
    }

    if (!diagnosis.isValid) {
        diagnosis.suggestion = 'The assessment data is incomplete or corrupted. Key behavioral dimensions are missing. It is recommended to start a new assessment for accurate results.';
        diagnosis.nextSteps = ['Start a new assessment to generate a complete and valid report.'];
    } else if (diagnosis.warnings.length > 0) {
        diagnosis.suggestion = 'The assessment data has some minor issues, but is likely usable. Some parts of the report might not be fully accurate. For the best experience, a new assessment is recommended.';
    }

    return diagnosis;
};
