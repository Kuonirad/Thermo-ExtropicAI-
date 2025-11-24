# TNN System Architecture: The Thermodynamic Stack

## 1. Core Philosophy
This is not just a physics engine; it is a **Thermodynamic Computer**.
*   **Input:** An Energy Landscape $E(x)$.
*   **Operation:** Thermal relaxation via Langevin Dynamics.
*   **Output:** Low-energy configurations (Optimization) or Equilibrium samples (Generative).

## 2. The Stack

### Level 0: The Thermodynamic Kernel (Compute)
*   **Role:** The "Hardware" Emulator.
*   **Logic:** $dx = -\nabla E(x)dt + \sqrt{2T}dW$.
*   **Tech:** WebGPU (Compute Shaders) or WASM.
*   **Key Invariant:** Detailed Balance (in equilibrium).

### Level 1: The Control Plane (Driver)
*   **Role:** The "Thermostat".
*   **Logic:** Controls Temperature $T(t)$ (Annealing), Batch Size, and Topology injection.
*   **Tech:** TypeScript / Node.js Worker.

### Level 2: The Observer (Telemetry)
*   **Role:** The "Thermometer".
*   **Logic:** Measures Micro-state statistics (Mean Energy, Variance) and Macro-state properties (Alpha/Criticality).
*   **Tech:** SharedArrayBuffer -> Analytics Engine.

### Level 3: The Viewport (Vis)
*   **Role:** Visualization of the Thermal Field.
*   **Logic:** Projects 4D Phase Space -> 2D Screen + Bloom (Heat proxy).
*   **Tech:** Three.js (WebGL).

## 3. Data Flow
```mermaid
graph TD
    Config[Thermostat Config] --> Driver
    Driver -->|Set Temp T(t)| Kernel
    Topology[Energy Landscape E(x)] --> Kernel
    Kernel[Thermodynamic Kernel] -->|Langevin Step| Kernel
    Kernel -->|State X(t)| Analytics
    Analytics -->|Calculate Alpha| Results[Research Data]
    Kernel -.->|Render| Viewport
```
