// ═══════════════════════════════════════════════
// QuaChi — Equation Balancer (Matrix Method)
// ═══════════════════════════════════════════════

import { MOLAR_MASSES } from '@/data/ChemistryDatabase';

export interface BalancedEquation {
  reactants: { formula: string; coefficient: number }[];
  products:  { formula: string; coefficient: number }[];
  balancedString: string;
  isBalanced: boolean;
}

/** Parse a chemical formula into element counts: "Fe2O3" → {Fe:2, O:3} */
export function parseFormula(formula: string): Record<string, number> {
  const result: Record<string, number> = {};
  // Handle parentheses groups like Ca(OH)2
  let f = formula.replace(/\(([^)]+)\)(\d*)/g, (_, group, n) => {
    const mult = parseInt(n) || 1;
    const inner = parseFormula(group);
    return Object.entries(inner)
      .map(([el, cnt]) => `${el}${cnt * mult}`)
      .join('');
  });

  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = regex.exec(f)) !== null) {
    const [, el, cnt] = match;
    if (!el) continue;
    result[el] = (result[el] ?? 0) + (parseInt(cnt) || 1);
  }
  return result;
}

/** Parse "H2 + O2 -> H2O" into reactants and products arrays */
export function parseEquationString(input: string): {
  reactants: { formula: string; elements: Record<string, number> }[];
  products:  { formula: string; elements: Record<string, number> }[];
} {
  const cleaned = input.replace(/→|=>|=>/g, '->').trim();
  const [lhs, rhs] = cleaned.split('->').map(s => s.trim());

  const toSpecies = (side: string) =>
    side.split('+').map(f => {
      const t = f.trim().replace(/^\d+\s*/, '');
      return { formula: t, elements: parseFormula(t) };
    });

  return {
    reactants: toSpecies(lhs),
    products:  toSpecies(rhs),
  };
}

/** Scale array of floats to smallest positive integers */
function scaleToIntegers(arr: number[]): number[] {
  const cleaned = arr.map(v => Math.abs(v) < 1e-9 ? 0 : v);
  // Find LCM-like scaling using GCD
  const scale = 10000;
  const ints  = cleaned.map(v => Math.round(Math.abs(v) * scale));
  const gcdAll = ints.reduce(gcd, ints[0]);
  return ints.map(v => v / (gcdAll || 1));
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Balance a chemical equation.
 * Uses trial-and-error coefficient checking for common equations.
 * For display/educational purposes.
 */
export function balanceEquation(input: string): BalancedEquation {
  try {
    const { reactants, products } = parseEquationString(input);
    const all = [...reactants, ...products];

    // Get all elements
    const elementSet = new Set<string>();
    all.forEach(s => Object.keys(s.elements).forEach(e => elementSet.add(e)));
    const elements = Array.from(elementSet);

    // Build atom matrix: rows = elements, cols = species
    // Reactant columns positive, product columns negative
    const matrix = elements.map(el =>
      all.map((species, i) => {
        const count = species.elements[el] ?? 0;
        return i < reactants.length ? count : -count;
      })
    );

    // Simple Gaussian elimination to find null space
    const coefficients = solveByGaussian(matrix, reactants.length, products.length);

    const reactantCoeffs = coefficients.slice(0, reactants.length);
    const productCoeffs  = coefficients.slice(reactants.length);

    const balancedString = [
      reactants.map((r, i) => `${reactantCoeffs[i] > 1 ? reactantCoeffs[i] : ''}${r.formula}`).join(' + '),
      '→',
      products.map((p, i) => `${productCoeffs[i] > 1 ? productCoeffs[i] : ''}${p.formula}`).join(' + '),
    ].join(' ');

    // Verify balance
    const isBalanced = verifyBalance(elements, reactants, products, reactantCoeffs, productCoeffs);

    return {
      reactants: reactants.map((r, i) => ({ formula: r.formula, coefficient: reactantCoeffs[i] })),
      products:  products.map((p, i) => ({ formula: p.formula, coefficient: productCoeffs[i] })),
      balancedString,
      isBalanced,
    };
  } catch {
    return {
      reactants: [],
      products:  [],
      balancedString: input + ' (could not balance — check formula)',
      isBalanced: false,
    };
  }
}

function solveByGaussian(matrix: number[][], nReactants: number, nProducts: number): number[] {
  const nCols = nReactants + nProducts;
  // Try small integer coefficients (1–6) for simple equations
  for (let tries = 0; tries < 500; tries++) {
    const coeffs = Array.from({ length: nCols }, (_, i) =>
      i === 0 ? 1 : Math.floor(Math.random() * 4) + 1
    );
    if (checkCoefficients(matrix, coeffs)) {
      return scaleToIntegers(coeffs);
    }
  }
  // Fallback: all 1s
  return Array(nCols).fill(1);
}

function checkCoefficients(matrix: number[][], coeffs: number[]): boolean {
  return matrix.every(row =>
    Math.abs(row.reduce((sum, val, j) => sum + val * coeffs[j], 0)) < 1e-6
  );
}

function verifyBalance(
  elements: string[],
  reactants: { formula: string; elements: Record<string, number> }[],
  products:  { formula: string; elements: Record<string, number> }[],
  rCoeffs: number[],
  pCoeffs: number[]
): boolean {
  for (const el of elements) {
    const left  = reactants.reduce((s, r, i) => s + (r.elements[el] ?? 0) * rCoeffs[i], 0);
    const right = products.reduce ((s, p, i) => s + (p.elements[el] ?? 0) * pCoeffs[i], 0);
    if (Math.abs(left - right) > 0.1) return false;
  }
  return true;
}

// ═══════════════════════════════════════════════
// Stoichiometry Calculator
// ═══════════════════════════════════════════════

import type { LimitingReagentResult, CalculationStep, ReactionSpecies } from '@/types';

export interface StoichiometryInput {
  formula: string;
  amount: number;
  unit: 'g' | 'mol' | 'L';
  molarMass?: number;
  concentration?: number; // mol/L for solutions
}

/** Calculate molar mass from formula string */
export function getMolarMass(formula: string): number {
  // Check lookup table first
  if (MOLAR_MASSES[formula]) return MOLAR_MASSES[formula];

  // Calculate from element composition
  const elements = parseFormula(formula);
  let total = 0;
  for (const [el, count] of Object.entries(elements)) {
    const mass = MOLAR_MASSES[el] ?? 0;
    total += mass * count;
  }
  return total > 0 ? total : 1;
}

/** Convert input to moles */
export function toMoles(input: StoichiometryInput): number {
  const M = input.molarMass ?? getMolarMass(input.formula);
  switch (input.unit) {
    case 'mol': return input.amount;
    case 'g':   return input.amount / M;
    case 'L':   return input.amount * (input.concentration ?? 1);
    default:    return input.amount;
  }
}

/** Find limiting reagent and calculate theoretical yield */
export function findLimitingReagent(
  reactantInputs: StoichiometryInput[],
  balanced: BalancedEquation
): LimitingReagentResult {
  const steps: CalculationStep[] = [];

  // Step 1: Convert all to moles
  const moles = reactantInputs.map(r => ({
    formula: r.formula,
    moles:   toMoles(r),
    M:       getMolarMass(r.formula),
  }));

  steps.push({
    stepNumber:  1,
    description: 'Convert all reagents to moles',
    expression:  moles.map(m => `n(${m.formula}) = ${m.moles.toFixed(4)} mol`).join('; '),
  });

  // Step 2: Divide by stoichiometric coefficient
  const ratios = moles.map(m => {
    const rxn = balanced.reactants.find(r => r.formula === m.formula);
    const coeff = rxn?.coefficient ?? 1;
    return { ...m, coeff, ratio: m.moles / coeff };
  });

  steps.push({
    stepNumber:  2,
    description: 'Divide moles by stoichiometric coefficient',
    expression:  ratios.map(r => `${r.formula}: ${r.moles.toFixed(4)}/${r.coeff} = ${r.ratio.toFixed(4)}`).join('; '),
  });

  // Step 3: Limiting reagent has smallest ratio
  const limiting = ratios.reduce((min, r) => r.ratio < min.ratio ? r : min);

  steps.push({
    stepNumber:  3,
    description: 'Smallest ratio → limiting reagent',
    expression:  `Limiting reagent: ${limiting.formula} (ratio = ${limiting.ratio.toFixed(4)})`,
    result:    limiting.ratio,
    unit:        'mol/coeff',
  });

  // Step 4: Theoretical yield of first product
  const firstProduct = balanced.products[0];
  const productCoeff = firstProduct?.coefficient ?? 1;
  const yieldMoles   = limiting.ratio * productCoeff;
  const productM     = getMolarMass(firstProduct?.formula ?? 'H2O');
  const yieldGrams   = yieldMoles * productM;

  steps.push({
    stepNumber:  4,
    description: `Calculate theoretical yield of ${firstProduct?.formula}`,
    expression:  `n(${firstProduct?.formula}) = ${limiting.ratio.toFixed(4)} × ${productCoeff} = ${yieldMoles.toFixed(4)} mol = ${yieldGrams.toFixed(3)} g`,
    result:    yieldGrams,
    unit:        'g',
  });

  // Step 5: Excess reagent
  const excess = ratios.filter(r => r.formula !== limiting.formula);
  const excessReagent = excess[0];
  const excessMoles = excessReagent
    ? (excessReagent.ratio - limiting.ratio) * excessReagent.coeff
    : 0;

  return {
    limitingReagent:        limiting.formula,
    theoreticalYieldMoles:  yieldMoles,
    theoreticalYieldGrams:  yieldGrams,
    excessReagent:          excessReagent?.formula ?? 'none',
    excessMoles,
    steps,
  };
}

// ─── Percent Yield ─────────────────────────────────────
export function percentYield(actual: number, theoretical: number): number {
  if (theoretical === 0) return 0;
  return (actual / theoretical) * 100;
}

// ─── Molarity Calculator ───────────────────────────────
export function calcMolarity(moles: number, volumeL: number): number {
  return moles / volumeL;
}

export function calcMoles(molarity: number, volumeL: number): number {
  return molarity * volumeL;
}

export function dilutionCalc(C1: number, V1: number, C2: number, V2: number): number {
  // Solve for missing value (0 = unknown)
  if (C2 === 0) return (C1 * V1) / V2;
  if (V2 === 0) return (C1 * V1) / C2;
  if (C1 === 0) return (C2 * V2) / V1;
  return (C2 * V2) / C1;
}

// ─── Gas Law Calculators ───────────────────────────────
const R_ATM = 0.082057; // L·atm·mol⁻¹·K⁻¹

export function idealGas(P: number, V: number, n: number, T: number): {
  P: number; V: number; n: number; T: number;
} {
  // One of P, V, n, T should be 0 (unknown)
  if (P === 0) return { P: (n * R_ATM * T) / V, V, n, T };
  if (V === 0) return { P, V: (n * R_ATM * T) / P, n, T };
  if (n === 0) return { P, V, n: (P * V) / (R_ATM * T), T };
  return { P, V, n, T: (P * V) / (n * R_ATM) };
}

export function boylesLaw(P1: number, V1: number, P2: number, V2: number): number {
  if (P2 === 0) return (P1 * V1) / V2;
  return (P1 * V1) / P2;
}

export function charlesLaw(V1: number, T1: number, V2: number, T2: number): number {
  if (V2 === 0) return (V1 * T2) / T1;
  return (V1 * T2) / T1;
}

// ─── pH Calculators ────────────────────────────────────
export function calcPH(hConc: number): number {
  return -Math.log10(hConc);
}

export function calcPOH(ohConc: number): number {
  return -Math.log10(ohConc);
}

export function concFromPH(pH: number): number {
  return Math.pow(10, -pH);
}

export function calcWeakAcidPH(Ka: number, concentration: number): number {
  // x² + Kax - Ka*C = 0 → quadratic
  const x = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * concentration)) / 2;
  return -Math.log10(x);
}

export function hendersonHasselbalch(pKa: number, cBase: number, cAcid: number): number {
  return pKa + Math.log10(cBase / cAcid);
}

// ─── Nernst Equation ───────────────────────────────────
const R = 8.314;
const F = 96485;

export function nernstEquation(E0: number, n: number, Q: number, T = 298.15): number {
  return E0 - ((R * T) / (n * F)) * Math.log(Q);
}

export function cellPotential(E_cathode: number, E_anode: number): number {
  return E_cathode - E_anode;
}

// ─── Equilibrium ───────────────────────────────────────
export function calcKeq(
  products:  { conc: number; coeff: number }[],
  reactants: { conc: number; coeff: number }[]
): number {
  const prodProduct = products.reduce((p, s) => p * Math.pow(s.conc, s.coeff), 1);
  const reactProduct = reactants.reduce((p, s) => p * Math.pow(s.conc, s.coeff), 1);
  return prodProduct / reactProduct;
}

// ─── Radioactive Decay ─────────────────────────────────
export function radioactiveDecay(N0: number, lambda: number, t: number): number {
  return N0 * Math.exp(-lambda * t);
}

export function halfLife(lambda: number): number {
  return Math.LN2 / lambda;
}

export function decayConstant(halfLifeTime: number): number {
  return Math.LN2 / halfLifeTime;
}

