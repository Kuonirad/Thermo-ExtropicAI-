import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { updatePhysics, CONSTANTS, calculateEnergy } from '../src/engine/physics';

describe('Physics Engine (Property Based)', () => {

    it('should maintain all particles within bounds', () => {
        fc.assert(
            fc.property(
                fc.float({ min: Math.fround(0.1), max: Math.fround(50.0) }), // Temperature
                fc.array(fc.float({ min: Math.fround(-10), max: Math.fround(10) }), { minLength: 4, maxLength: 40 }), // Positions (flat 4D agents)
                (temp, initialPositions) => {
                    // Setup
                    // Ensure length is multiple of 4
                    const len = initialPositions.length - (initialPositions.length % 4);
                    const positions = new Float32Array(initialPositions.slice(0, len));
                    const energies = new Float32Array(len / 4);

                    const state = { positions, energies, step: 0, temp };

                    // Act
                    updatePhysics(state, 0.01, true); // Langevin

                    // Assert
                    for(let i=0; i<positions.length; i++) {
                        // With float32 precision and our bounds, slightly loose check is needed sometimes, but logic clamps hard.
                        expect(positions[i]).toBeLessThanOrEqual(CONSTANTS.BOUNDS + 1e-5);
                        expect(positions[i]).toBeGreaterThanOrEqual(-CONSTANTS.BOUNDS - 1e-5);
                        expect(Number.isFinite(positions[i])).toBe(true);
                    }
                }
            )
        );
    });

    it('should handle NaN/Infinity gracefully (Safety Test)', () => {
         // Manually inject garbage
         const positions = new Float32Array([NaN, Infinity, -Infinity, 0]);
         const energies = new Float32Array(1);
         const state = { positions, energies, step: 0, temp: NaN };

         updatePhysics(state, 0.01, true);

         for(let i=0; i<positions.length; i++) {
             expect(Number.isFinite(positions[i])).toBe(true);
             expect(Math.abs(positions[i])).toBeLessThanOrEqual(CONSTANTS.BOUNDS + 1e-5);
         }
    });

    it('should calculate energy deterministically', () => {
        fc.assert(
            fc.property(
                fc.array(fc.float({ min: Math.fround(-5), max: Math.fround(5), noNaN: true }), { minLength: 4, maxLength: 4 }),
                (posArray) => {
                    const pos = new Float32Array(posArray);
                    const e1 = calculateEnergy(pos, 0);
                    const e2 = calculateEnergy(pos, 0);
                    // Float32 vs JS Double issue might occur if not careful, but here we just read same array
                    expect(e1).toBeCloseTo(e2, 5);
                    expect(Number.isFinite(e1)).toBe(true);
                    expect(e1).toBeGreaterThanOrEqual(0);
                }
            )
        );
    });
});
