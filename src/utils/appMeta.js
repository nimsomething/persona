import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version; // "3.0.1"
export const APP_NAME = 'Birkman Personality Assessment';
export const APP_DESCRIPTION = 'Discover your personality strengths and career fit';
export const APP_VERSION_LABEL = `v${APP_VERSION}`;

// Version checking utilities
export const isV2Assessment = (version) => version?.startsWith('2.');
export const isV3Assessment = (version) => version?.startsWith('3.');
export const canUpgradeFromV2 = (version) => isV2Assessment(version);
export const getVersionLabel = (version) => {
  if (!version) return 'Unknown';
  if (isV2Assessment(version)) return `v${version} (Legacy)`;
  if (isV3Assessment(version)) return `v${version}`;
  return `v${version}`;
};

// Feature availability by version
export const FEATURES = {
  V2: {
    dimensions: true,
    archetypes: true,
    mbti: true,
    values: true,
    workStyle: true,
    pdfPages: 13,
    components: false,
    birkmanColor: false,
    internalStates: false
  },
  V3: {
    dimensions: true,
    archetypes: true,
    mbti: true,
    values: true,
    workStyle: true,
    pdfPages: 32,
    components: true,
    birkmanColor: true,
    internalStates: true,
    careerGuidance: true
  }
};

export const getFeatures = (version) => {
  if (isV2Assessment(version)) return FEATURES.V2;
  if (isV3Assessment(version)) return FEATURES.V3;
  return FEATURES.V3; // Default to latest
};

// Compatibility checking
export const isCompatibleVersion = (version) => {
  if (!version) return false;
  return isV2Assessment(version) || isV3Assessment(version);
};