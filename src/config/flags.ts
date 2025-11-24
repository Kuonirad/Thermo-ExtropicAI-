export const FLAGS = {
    // Feature Flags
    ENABLE_GLACIOLOGY: true,
    USE_DIGITAL_NOISE: false, // Toggle for Langevin vs GD
    ENABLE_BLOOM: true,

    // Safety & Performance
    MAX_PARTICLES: 5000,
    MIN_PARTICLES: 100,
    MAX_DT: 0.1, // Prevent explosion if lag occurs

    // Debug
    DEBUG_MODE: false
};

export const isFlagEnabled = (flag: keyof typeof FLAGS) => FLAGS[flag];
