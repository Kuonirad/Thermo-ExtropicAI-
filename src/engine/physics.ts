import { FLAGS } from '../config/flags';

export const CONSTANTS = {
    DIM: 4,
    BOUNDS: 5.12,
    A: 10,
    PI_2: Math.PI * 2
};

export interface SimulationState {
    positions: Float32Array; // Flat array [x1, y1, z1, w1, x2, y2, z2, w2...]
    energies: Float32Array;  // Flat array [e1, e2...]
    step: number;
    temp: number;
}

// Rastrigin Function: Non-convex, multimodal
// f(x) = A*n + sum(x_i^2 - A*cos(2*pi*x_i))
export function calculateEnergy(pos: Float32Array, offset: number): number {
    let sum = 0;
    for (let i = 0; i < CONSTANTS.DIM; i++) {
        const xi = pos[offset + i];
        sum += (xi * xi - CONSTANTS.A * Math.cos(CONSTANTS.PI_2 * xi));
    }
    return CONSTANTS.A * CONSTANTS.DIM + sum;
}

// Gradient of Rastrigin
// df/dx_i = 2x_i + 2*pi*A*sin(2*pi*x_i)
export function calculateGradient(pos: Float32Array, offset: number, outGrad: Float32Array) {
    for (let i = 0; i < CONSTANTS.DIM; i++) {
        const xi = pos[offset + i];
        outGrad[i] = 2 * xi + CONSTANTS.PI_2 * CONSTANTS.A * Math.sin(CONSTANTS.PI_2 * xi);
    }
}

// Box-Muller Transform for Gaussian Noise
export function randn(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function updatePhysics(state: SimulationState, dt: number, useLangevin: boolean) {
    // Safety: Clamp DT to prevent numerical explosion
    const safeDt = Math.min(Math.max(0, dt), FLAGS.MAX_DT);

    // Safety: Validate inputs
    if (!Number.isFinite(state.temp) || state.temp < 0) state.temp = 0.1;

    const count = state.energies.length;
    const dim = CONSTANTS.DIM;

    const sqDT = Math.sqrt(2 * state.temp * safeDt); // Langevin Thermal Noise
    const gdNoise = Math.sqrt(2 * 20.0 * safeDt);   // Fixed "Digital" Noise reference

    let totalEnergy = 0;
    let minEnergy = Infinity;

    for (let i = 0; i < count; i++) {
        const offset = i * dim;

        for (let k = 0; k < dim; k++) {
            const pIdx = offset + k;
            let x = state.positions[pIdx];

            // Safety: Recover from NaN/Infinity
            if (!Number.isFinite(x)) {
                x = (Math.random() * 10.24) - 5.12;
            }

            // Gradient calc
            const grad = 2 * x + CONSTANTS.PI_2 * CONSTANTS.A * Math.sin(CONSTANTS.PI_2 * x);

            // Noise
            const noise = randn();

            let step = 0;
            if (useLangevin) {
                step = -(grad * safeDt) + (sqDT * noise);
            } else {
                step = -(grad * safeDt) + (gdNoise * noise);
            }

            // Update
            let newPos = x + step;

            // Reflective Bounds (Safety Invariant)
            if (newPos > CONSTANTS.BOUNDS) {
                newPos = CONSTANTS.BOUNDS - (newPos - CONSTANTS.BOUNDS);
            } else if (newPos < -CONSTANTS.BOUNDS) {
                newPos = -CONSTANTS.BOUNDS - (newPos - -CONSTANTS.BOUNDS);
            }

            // Fail-safe clamp if reflection failed (e.g. huge step or NaN from step)
            if (newPos > CONSTANTS.BOUNDS) newPos = CONSTANTS.BOUNDS;
            if (newPos < -CONSTANTS.BOUNDS) newPos = -CONSTANTS.BOUNDS;
            if (!Number.isFinite(newPos)) newPos = 0; // Last resort reset

            state.positions[pIdx] = newPos;
        }

        // Update Energy
        const e = calculateEnergy(state.positions, offset);
        state.energies[i] = e;

        totalEnergy += e;
        if (e < minEnergy) minEnergy = e;
    }

    return { totalEnergy, minEnergy };
}
