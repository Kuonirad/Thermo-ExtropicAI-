import { updatePhysics, CONSTANTS, SimulationState } from '../src/engine/physics';

// Baseline: Standard Gradient Descent (No Thermal Noise, just learning rate)
function updateGD(state: SimulationState, lr: number) {
    const count = state.energies.length;
    const dim = CONSTANTS.DIM;
    let totalEnergy = 0;
    let minEnergy = Infinity;

    for (let i = 0; i < count; i++) {
        const offset = i * dim;
        for (let k = 0; k < dim; k++) {
            const pIdx = offset + k;
            const x = state.positions[pIdx];
            // Gradient
            const grad = 2 * x + CONSTANTS.PI_2 * CONSTANTS.A * Math.sin(CONSTANTS.PI_2 * x);
            // Update: x = x - lr * grad
            let newPos = x - (lr * grad);

            // Bounds
            if (newPos > CONSTANTS.BOUNDS) newPos = CONSTANTS.BOUNDS;
            if (newPos < -CONSTANTS.BOUNDS) newPos = -CONSTANTS.BOUNDS;

            state.positions[pIdx] = newPos;
        }
        // Energy
        let sum = 0;
        for (let k = 0; k < dim; k++) {
            const x = state.positions[offset + k];
            sum += (x * x - CONSTANTS.A * Math.cos(CONSTANTS.PI_2 * x));
        }
        const e = CONSTANTS.A * CONSTANTS.DIM + sum;
        state.energies[i] = e;
        totalEnergy += e;
        if (e < minEnergy) minEnergy = e;
    }
    return { totalEnergy, minEnergy };
}

// Harness
const TRIALS = 5;
const AGENTS = 100;
const STEPS = 1000;

console.log(`\n=== RESEARCH BENCHMARK: Langevin vs GD (Rastrigin 4D) ===`);
console.log(`Agents: ${AGENTS}, Steps: ${STEPS}, Trials: ${TRIALS}\n`);

// 1. Run Langevin
let langevinGlobalMin = Infinity;
let langevinAvgFinal = 0;

for(let t=0; t<TRIALS; t++) {
    const pos = new Float32Array(AGENTS * 4);
    for(let i=0; i<pos.length; i++) pos[i] = (Math.random()*10.24)-5.12;
    const state = { positions: pos, energies: new Float32Array(AGENTS), step: 0, temp: 5.0 }; // Constant temp

    let runMin = Infinity;
    for(let s=0; s<STEPS; s++) {
        // Linear Annealing
        state.temp = 20 * (1 - s/STEPS);
        const metrics = updatePhysics(state, 0.01, true);
        if (metrics.minEnergy < runMin) runMin = metrics.minEnergy;
    }
    langevinGlobalMin = Math.min(langevinGlobalMin, runMin);
    langevinAvgFinal += runMin;
}
langevinAvgFinal /= TRIALS;

// 2. Run Standard GD
let gdGlobalMin = Infinity;
let gdAvgFinal = 0;

for(let t=0; t<TRIALS; t++) {
    const pos = new Float32Array(AGENTS * 4);
    for(let i=0; i<pos.length; i++) pos[i] = (Math.random()*10.24)-5.12;
    const state = { positions: pos, energies: new Float32Array(AGENTS), step: 0, temp: 0 };

    let runMin = Infinity;
    for(let s=0; s<STEPS; s++) {
        const metrics = updateGD(state, 0.01);
        if (metrics.minEnergy < runMin) runMin = metrics.minEnergy;
    }
    gdGlobalMin = Math.min(gdGlobalMin, runMin);
    gdAvgFinal += runMin;
}
gdAvgFinal /= TRIALS;

console.log(`RESULTS:`);
console.log(`------------------------------------------------`);
console.log(`Langevin (Annealed) | Best: ${langevinGlobalMin.toFixed(4)} | Avg Best: ${langevinAvgFinal.toFixed(4)}`);
console.log(`Standard GD         | Best: ${gdGlobalMin.toFixed(4)} | Avg Best: ${gdAvgFinal.toFixed(4)}`);
console.log(`------------------------------------------------`);

if (langevinAvgFinal < gdAvgFinal) {
    console.log(`CONCLUSION: Thermodynamic exploration statistically outperforms greedy descent on non-convex landscapes.`);
} else {
    console.log(`CONCLUSION: Inconclusive. Rastrigin might be too simple or schedule unoptimized.`);
}
