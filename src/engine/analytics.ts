export class AnalyticsEngine {
    private history: number[] = [];
    private readonly WINDOW_SIZE = 100;

    public push(energy: number) {
        // Safety: Handle NaN or Infinity
        if (!isFinite(energy)) return;

        this.history.push(energy);
        // Keep memory O(1) relative to simulation steps (fixed window)
        if (this.history.length > this.WINDOW_SIZE * 2) {
            this.history = this.history.slice(-this.WINDOW_SIZE);
        }
    }

    public calculateAlpha(currentStep: number): number {
        if (this.history.length < this.WINDOW_SIZE) return 0;

        // Get last N samples
        const slice = this.history.slice(-this.WINDOW_SIZE);

        // Log-Log Transform
        // Safety: energy must be > 0 for log. Rastrigin Min is 0.
        // We add a small epsilon 1e-6 to avoid log(0).
        const logE = slice.map(e => Math.log(Math.max(e, 1e-6)));

        // Time axis: t is derived from currentStep
        const logT = Array.from({length: this.WINDOW_SIZE}, (_, i) =>
            Math.log(currentStep - this.WINDOW_SIZE + i + 1)
        );

        const n = this.WINDOW_SIZE;
        let sumT = 0, sumE = 0, sumTE = 0, sumTT = 0;

        // O(N) loop over window
        for(let i=0; i<n; i++) {
            sumT += logT[i];
            sumE += logE[i];
            sumTE += logT[i] * logE[i];
            sumTT += logT[i] * logT[i];
        }

        const denominator = (n * sumTT - sumT * sumT);

        // Safety: Prevent division by zero if time doesn't advance (impossible in normal run)
        if (Math.abs(denominator) < 1e-9) return 0;

        const slope = (n * sumTE - sumT * sumE) / denominator;

        // Power law relation: E ~ t^(-alpha) => logE ~ -alpha * logT
        return -slope;
    }

    public getAnalysis(alpha: number): { status: string, description: string, color: string } {
        if (alpha < -0.01) {
            return {
                status: "BASAL SLIDING (PLATEAU)",
                description: "System de-coupled from landscape. Hydroplaning on noise.",
                color: "text-rose-400"
            };
        } else if (alpha > 0.08) {
            return {
                status: "BEDROCK CARVING (CONVERGENCE)",
                description: "Strong entropy dissipation. Exploiting gradients.",
                color: "text-emerald-400"
            };
        } else {
            return {
                status: "CRITICALITY PHASE",
                description: "Approaching 'Edge of Chaos'. Searching percolation threshold.",
                color: "text-yellow-400"
            };
        }
    }
}
