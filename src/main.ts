import * as THREE from 'three';
import { updatePhysics, CONSTANTS, SimulationState } from './engine/physics';
import { AnalyticsEngine } from './engine/analytics';
import { FLAGS } from './config/flags';
// We will use the global Chart instance from the CDN for now to match original,
// or import it if we want full strictness. Let's stick to the "hybrid" approach
// where we assume the DOM elements exist.

// DOM Elements
const elements = {
    tempSlider: document.getElementById('temp-slider') as HTMLInputElement,
    tempVal: document.getElementById('temp-val') as HTMLElement,
    batchSlider: document.getElementById('batch-slider') as HTMLInputElement,
    batchVal: document.getElementById('batch-val') as HTMLElement,
    annealSelect: document.getElementById('anneal-select') as HTMLSelectElement,
    methodSelect: document.getElementById('method-select') as HTMLSelectElement,
    simStatus: document.getElementById('sim-status') as HTMLElement,
    stepCount: document.getElementById('step-count') as HTMLElement,
    avgEnergy: document.getElementById('avg-energy') as HTMLElement,
    minEnergy: document.getElementById('min-energy') as HTMLElement,
    alphaVal: document.getElementById('alpha-val') as HTMLElement,
    alphaBar: document.getElementById('alpha-bar') as HTMLElement,
    analysisText: document.getElementById('analysis-text') as HTMLElement,
    canvasContainer: document.getElementById('canvas-container') as HTMLElement,
};

// State
const state: SimulationState = {
    positions: new Float32Array(0),
    energies: new Float32Array(0),
    step: 0,
    temp: 20
};

let isRunning = false;
let animationId: number;
let annealingMode = 'logarithmic';
let physicsMethod = 'langevin';
let initialTemp = 20;

const analytics = new AnalyticsEngine();

// Visualization
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particleSystem: THREE.Points;

function initVisuals() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.025);

    camera = new THREE.PerspectiveCamera(60, elements.canvasContainer.clientWidth / elements.canvasContainer.clientHeight, 0.1, 100);
    camera.position.set(14, 12, 14);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(elements.canvasContainer.clientWidth, elements.canvasContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    elements.canvasContainer.appendChild(renderer.domElement);

    // Lights & Terrain (Simplified for this implementation)
    const geometry = new THREE.PlaneGeometry(16, 16, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x1e1b4b, wireframe: true });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
}

function initParticles(count: number) {
    if (particleSystem) scene.remove(particleSystem);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3); // normalized r,g,b

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.4, vertexColors: true });
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function updateVisuals() {
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    const colors = particleSystem.geometry.attributes.color.array as Float32Array;

    const count = state.energies.length;
    const dim = CONSTANTS.DIM;

    const colorHot = new THREE.Color(0xf0abfc);
    const colorCold = new THREE.Color(0x4f46e5);
    const colorConv = new THREE.Color(0x4ade80);
    const scratchColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
        const offset = i * dim;
        const x = state.positions[offset];
        const y = state.positions[offset + 1];
        const w = state.positions[offset + 3];
        const e = state.energies[i];

        // Project 4D -> 3D
        positions[i * 3] = x + w * 0.2;
        positions[i * 3 + 1] = e * 0.1 + 0.2;
        positions[i * 3 + 2] = y - w * 0.2;

        // Color
        const normE = Math.min(e / 80, 1);
        if (normE < 0.1) {
            colors[i*3] = colorConv.r;
            colors[i*3+1] = colorConv.g;
            colors[i*3+2] = colorConv.b;
        } else {
            const tFactor = Math.min(state.temp / 50, 1);
            scratchColor.lerpColors(colorCold, colorHot, tFactor);
            colors[i*3] = scratchColor.r;
            colors[i*3+1] = scratchColor.g;
            colors[i*3+2] = scratchColor.b;
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

// Main Loop
function loop() {
    if (!isRunning) return;

    // Annealing
    if (annealingMode === 'linear') {
        state.temp = Math.max(0.01, initialTemp * (1 - state.step / 50000));
    } else if (annealingMode === 'logarithmic') {
        state.temp = initialTemp / Math.log(state.step + 5);
    }

    // Physics
    const metrics = updatePhysics(state, 0.002, physicsMethod === 'langevin');

    // Analytics
    if (state.step % 20 === 0) {
        const avg = metrics.totalEnergy / state.energies.length;
        analytics.push(avg);

        elements.avgEnergy.textContent = avg.toFixed(2);
        elements.minEnergy.textContent = metrics.minEnergy.toFixed(2);
        elements.stepCount.textContent = state.step.toString();

        const alpha = analytics.calculateAlpha(state.step);
        elements.alphaVal.textContent = alpha.toFixed(4);

        // Update Alpha Bar
        let pct = 50 + (alpha * 200);
        pct = Math.max(0, Math.min(100, pct));
        elements.alphaBar.style.width = Math.abs(alpha * 200) + "%";
        elements.alphaBar.style.left = alpha >= 0 ? "50%" : (50 - Math.abs(alpha * 200)) + "%";

        const analysis = analytics.getAnalysis(alpha);
        elements.analysisText.innerHTML = `<span class="${analysis.color} font-bold">${analysis.status}</span><br>${analysis.description}`;
    }

    updateVisuals();
    state.step++;
    animationId = requestAnimationFrame(loop);
}

// Public API for Buttons
(window as any).startSimulation = () => {
    if (isRunning) return;
    isRunning = true;
    elements.simStatus.textContent = "IGNITED";
    elements.simStatus.className = "text-indigo-400 font-bold animate-pulse";

    // Init if step 0
    if (state.step === 0) {
        const count = parseInt(elements.batchSlider.value);
        const dim = CONSTANTS.DIM;
        state.positions = new Float32Array(count * dim);
        state.energies = new Float32Array(count);

        // Random init
        for(let i=0; i<state.positions.length; i++) {
            state.positions[i] = (Math.random() * 10.24) - 5.12;
        }

        initParticles(count);
        initialTemp = parseFloat(elements.tempSlider.value);
        state.temp = initialTemp;
    }

    loop();
};

(window as any).resetSimulation = () => {
    isRunning = false;
    cancelAnimationFrame(animationId);
    state.step = 0;
    elements.simStatus.textContent = "STANDBY";
    elements.simStatus.className = "text-yellow-500";
    // Clear history
    // Re-init is handled in start
};

// Init
initVisuals();

// Event Listeners
elements.tempSlider.addEventListener('input', (e) => {
    const v = (e.target as HTMLInputElement).value;
    elements.tempVal.textContent = parseFloat(v).toFixed(1);
    if (!isRunning) initialTemp = parseFloat(v);
});

elements.batchSlider.addEventListener('input', (e) => {
    elements.batchVal.textContent = (e.target as HTMLInputElement).value;
});

elements.annealSelect.addEventListener('change', (e) => {
    annealingMode = (e.target as HTMLSelectElement).value;
});

elements.methodSelect.addEventListener('change', (e) => {
    physicsMethod = (e.target as HTMLSelectElement).value;
});
