import type { MoleculeDefinition } from '@/types';

// ═══════════════════════════════════════════════
// Chemistry Constants
// ═══════════════════════════════════════════════

export const CONSTANTS = {
  R_SI:          8.31446,        // J·mol⁻¹·K⁻¹
  R_ATM:         0.082057,       // L·atm·mol⁻¹·K⁻¹
  AVOGADRO:      6.02214076e23,  // mol⁻¹
  FARADAY:       96485.33212,    // C·mol⁻¹
  PLANCK:        6.62607015e-34, // J·s
  SPEED_LIGHT:   2.99792458e8,   // m·s⁻¹
  BOLTZMANN:     1.380649e-23,   // J·K⁻¹
  STP_TEMP:      273.15,         // K
  STP_PRESSURE:  101325,         // Pa
  SATP_TEMP:     298.15,         // K
  STANDARD_MOLAR_VOLUME: 22.414, // L/mol at STP
  SATP_MOLAR_VOLUME: 24.790,     // L/mol at SATP
  WATER_KW:      1.0e-14,        // at 25°C
  CELSIUS_OFFSET: 273.15,
} as const;

// ═══════════════════════════════════════════════
// Key Chemistry Formulas (display strings)
// ═══════════════════════════════════════════════

export const FORMULAS: Record<string, { name: string; formula: string; latex: string; topic: string }> = {
  IDEAL_GAS: {
    name: 'Ideal Gas Law',
    formula: 'PV = nRT',
    latex: 'PV = nRT',
    topic: 'Gas Laws',
  },
  MOLARITY: {
    name: 'Molarity',
    formula: 'M = n / V',
    latex: 'M = \\frac{n}{V}',
    topic: 'Solutions',
  },
  MOLES_MASS: {
    name: 'Moles from Mass',
    formula: 'n = m / M',
    latex: 'n = \\frac{m}{M}',
    topic: 'Stoichiometry',
  },
  DILUTION: {
    name: 'Dilution',
    formula: 'C₁V₁ = C₂V₂',
    latex: 'C_1V_1 = C_2V_2',
    topic: 'Solutions',
  },
  RATE_LAW: {
    name: 'Rate Law',
    formula: 'rate = k[A]ᵐ[B]ⁿ',
    latex: '\\text{rate} = k[A]^m[B]^n',
    topic: 'Kinetics',
  },
  ARRHENIUS: {
    name: 'Arrhenius Equation',
    formula: 'k = Ae^(-Ea/RT)',
    latex: 'k = A e^{-E_a/RT}',
    topic: 'Kinetics',
  },
  HENDERSON_H: {
    name: 'Henderson-Hasselbalch',
    formula: 'pH = pKa + log([A⁻]/[HA])',
    latex: 'pH = pK_a + \\log\\frac{[A^-]}{[HA]}',
    topic: 'Acids & Bases',
  },
  NERNST: {
    name: 'Nernst Equation',
    formula: 'E = E° - (RT/nF)ln(Q)',
    latex: 'E = E^\\circ - \\frac{RT}{nF}\\ln Q',
    topic: 'Electrochemistry',
  },
  GIBBS: {
    name: "Gibbs Free Energy",
    formula: 'ΔG = ΔH - TΔS',
    latex: '\\Delta G = \\Delta H - T\\Delta S',
    topic: 'Thermochemistry',
  },
  HESS: {
    name: "Hess's Law",
    formula: 'ΔHrxn = ΣΔHf°(products) - ΣΔHf°(reactants)',
    latex: '\\Delta H_{rxn} = \\sum \\Delta H_f^\\circ(\\text{prod}) - \\sum \\Delta H_f^\\circ(\\text{react})',
    topic: 'Thermochemistry',
  },
  PH_DEF: {
    name: 'pH Definition',
    formula: 'pH = -log[H⁺]',
    latex: 'pH = -\\log[H^+]',
    topic: 'Acids & Bases',
  },
  KW: {
    name: 'Water Autoionisation',
    formula: 'Kw = [H⁺][OH⁻] = 1×10⁻¹⁴',
    latex: 'K_w = [H^+][OH^-] = 1 \\times 10^{-14}',
    topic: 'Acids & Bases',
  },
  KEQ: {
    name: 'Equilibrium Constant',
    formula: 'Keq = [products]^coeff / [reactants]^coeff',
    latex: 'K_{eq} = \\frac{[C]^c[D]^d}{[A]^a[B]^b}',
    topic: 'Equilibrium',
  },
  BEER_LAMBERT: {
    name: 'Beer-Lambert Law',
    formula: 'A = εlc',
    latex: 'A = \\varepsilon l c',
    topic: 'Analytical',
  },
  PERCENT_YIELD: {
    name: 'Percent Yield',
    formula: '% yield = (actual / theoretical) × 100',
    latex: '\\% \\text{yield} = \\frac{\\text{actual}}{\\text{theoretical}} \\times 100',
    topic: 'Stoichiometry',
  },
  FARADAY_LAW: {
    name: "Faraday's Law of Electrolysis",
    formula: 'm = (M × I × t) / (n × F)',
    latex: 'm = \\frac{M \\cdot I \\cdot t}{n \\cdot F}',
    topic: 'Electrochemistry',
  },
  DECAY: {
    name: 'Radioactive Decay',
    formula: 'N = N₀e^(-λt)',
    latex: 'N = N_0 e^{-\\lambda t}',
    topic: 'Nuclear',
  },
  HALF_LIFE: {
    name: 'Half-Life (1st order)',
    formula: 't₁/₂ = 0.693 / k',
    latex: 't_{1/2} = \\frac{0.693}{k}',
    topic: 'Kinetics',
  },
};

// ═══════════════════════════════════════════════
// Molar Masses of Common Compounds (g/mol)
// ═══════════════════════════════════════════════

export const MOLAR_MASSES: Record<string, number> = {
  'H':    1.008,   'He':   4.003,   'Li':   6.941,   'Be':   9.012,
  'B':    10.811,  'C':    12.011,  'N':    14.007,  'O':    15.999,
  'F':    18.998,  'Ne':   20.180,  'Na':   22.990,  'Mg':   24.305,
  'Al':   26.982,  'Si':   28.086,  'P':    30.974,  'S':    32.06,
  'Cl':   35.45,   'Ar':   39.948,  'K':    39.098,  'Ca':   40.078,
  'Fe':   55.845,  'Cu':   63.546,  'Zn':   65.38,   'Br':   79.904,
  'Ag':   107.868, 'I':    126.904, 'Ba':   137.327, 'Au':   196.967,
  'Pb':   207.2,
  // Common compounds
  'H2O':   18.015,  'CO2':   44.010, 'HCl':   36.461,  'NaOH':  39.997,
  'NaCl':  58.440,  'H2SO4': 98.079, 'HNO3':  63.013,  'NH3':   17.031,
  'CH4':   16.043,  'C2H6':  30.069, 'C3H8':  44.096,  'C6H6':  78.114,
  'CH3COOH': 60.052,'CaCO3':100.087,'Ca(OH)2':74.093, 'MgSO4': 120.366,
  'KMnO4': 158.034,'K2Cr2O7':294.185,'CuSO4':159.609,'FeSO4':151.908,
  'Na2CO3':105.988,'NaHCO3': 84.007,'NH4Cl': 53.491,
  'C2H5OH': 46.069,'C12H22O11': 342.297,'CH3OH': 32.042,
  'H3PO4': 97.994, 'H2CO3': 62.025, 'HF': 20.006,
  'AgNO3': 169.872,'BaSO4': 233.390,'PbCl2': 278.106,
  'ZnSO4': 161.472,'Fe2O3': 159.688,'Al2O3': 101.961,
};

// ═══════════════════════════════════════════════
// Ka Values for Common Acids
// ═══════════════════════════════════════════════

export const KA_VALUES: Record<string, { name: string; Ka: number; pKa: number; type: 'strong' | 'weak' }> = {
  'HCl':      { name: 'Hydrochloric acid',  Ka: 1.3e6,    pKa: -6.3, type: 'strong' },
  'HNO3':     { name: 'Nitric acid',        Ka: 25,       pKa: -1.4, type: 'strong' },
  'H2SO4':    { name: 'Sulfuric acid',      Ka: 1e3,      pKa: -3.0, type: 'strong' },
  'HBr':      { name: 'Hydrobromic acid',   Ka: 1e9,      pKa: -9.0, type: 'strong' },
  'HI':       { name: 'Hydroiodic acid',    Ka: 1e10,     pKa: -10,  type: 'strong' },
  'CH3COOH':  { name: 'Ethanoic acid',      Ka: 1.74e-5,  pKa: 4.76, type: 'weak' },
  'HF':       { name: 'Hydrofluoric acid',  Ka: 6.76e-4,  pKa: 3.17, type: 'weak' },
  'H2CO3':    { name: 'Carbonic acid',      Ka: 4.47e-7,  pKa: 6.35, type: 'weak' },
  'H3PO4':    { name: 'Phosphoric acid',    Ka: 7.08e-3,  pKa: 2.15, type: 'weak' },
  'NH4+':     { name: 'Ammonium ion',       Ka: 5.62e-10, pKa: 9.25, type: 'weak' },
  'HCN':      { name: 'Hydrocyanic acid',   Ka: 6.2e-10,  pKa: 9.21, type: 'weak' },
};

// ═══════════════════════════════════════════════
// Standard Electrode Potentials (V, vs SHE)
// ═══════════════════════════════════════════════

export const ELECTRODE_POTENTIALS: { species: string; halfReaction: string; E0: number; n: number }[] = [
  { species: 'Li⁺/Li',    halfReaction: 'Li⁺(aq) + e⁻ → Li(s)',              E0: -3.04, n: 1 },
  { species: 'K⁺/K',      halfReaction: 'K⁺(aq) + e⁻ → K(s)',                E0: -2.92, n: 1 },
  { species: 'Ca²⁺/Ca',   halfReaction: 'Ca²⁺(aq) + 2e⁻ → Ca(s)',            E0: -2.87, n: 2 },
  { species: 'Na⁺/Na',    halfReaction: 'Na⁺(aq) + e⁻ → Na(s)',              E0: -2.71, n: 1 },
  { species: 'Mg²⁺/Mg',   halfReaction: 'Mg²⁺(aq) + 2e⁻ → Mg(s)',            E0: -2.37, n: 2 },
  { species: 'Al³⁺/Al',   halfReaction: 'Al³⁺(aq) + 3e⁻ → Al(s)',            E0: -1.66, n: 3 },
  { species: 'Zn²⁺/Zn',   halfReaction: 'Zn²⁺(aq) + 2e⁻ → Zn(s)',            E0: -0.76, n: 2 },
  { species: 'Fe²⁺/Fe',   halfReaction: 'Fe²⁺(aq) + 2e⁻ → Fe(s)',            E0: -0.44, n: 2 },
  { species: 'Ni²⁺/Ni',   halfReaction: 'Ni²⁺(aq) + 2e⁻ → Ni(s)',            E0: -0.25, n: 2 },
  { species: 'Pb²⁺/Pb',   halfReaction: 'Pb²⁺(aq) + 2e⁻ → Pb(s)',            E0: -0.13, n: 2 },
  { species: 'H⁺/H₂',     halfReaction: '2H⁺(aq) + 2e⁻ → H₂(g)',             E0:  0.00, n: 2 },
  { species: 'Cu²⁺/Cu',   halfReaction: 'Cu²⁺(aq) + 2e⁻ → Cu(s)',            E0: +0.34, n: 2 },
  { species: 'I₂/I⁻',     halfReaction: 'I₂(s) + 2e⁻ → 2I⁻(aq)',             E0: +0.54, n: 2 },
  { species: 'Fe³⁺/Fe²⁺', halfReaction: 'Fe³⁺(aq) + e⁻ → Fe²⁺(aq)',          E0: +0.77, n: 1 },
  { species: 'Ag⁺/Ag',    halfReaction: 'Ag⁺(aq) + e⁻ → Ag(s)',              E0: +0.80, n: 1 },
  { species: 'Br₂/Br⁻',   halfReaction: 'Br₂(l) + 2e⁻ → 2Br⁻(aq)',           E0: +1.09, n: 2 },
  { species: 'Cl₂/Cl⁻',   halfReaction: 'Cl₂(g) + 2e⁻ → 2Cl⁻(aq)',           E0: +1.36, n: 2 },
  { species: 'MnO₄⁻/Mn²⁺',halfReaction: 'MnO₄⁻(aq) + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O', E0: +1.51, n: 5 },
  { species: 'F₂/F⁻',     halfReaction: 'F₂(g) + 2e⁻ → 2F⁻(aq)',             E0: +2.87, n: 2 },
];

// ═══════════════════════════════════════════════
// Molecule Library for 3D Viewer
// ═══════════════════════════════════════════════

export const MOLECULES: MoleculeDefinition[] = [
  {
    id: 'h2o',
    name: 'Water',
    formula: 'H₂O',
    geometry: 'Bent',
    bondAngle: '104.5°',
    description: 'Bent geometry due to 2 lone pairs on oxygen. Essential solvent for life.',
    dipole: '1.85 D',
    atoms: [
      { id: 0, element: 'O', x: 0,      y: 0,     z: 0,    cpkColor: '#FF0D0D', radius: 0.73 },
      { id: 1, element: 'H', x: 0.757,  y: 0.586, z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 2, element: 'H', x: -0.757, y: 0.586, z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
    ],
  },
  {
    id: 'co2',
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    geometry: 'Linear',
    bondAngle: '180°',
    description: 'Linear molecule with two double bonds. Greenhouse gas and product of combustion.',
    dipole: '0 D',
    atoms: [
      { id: 0, element: 'C', x: 0,      y: 0, z: 0, cpkColor: '#404040', radius: 0.76 },
      { id: 1, element: 'O', x: 1.162,  y: 0, z: 0, cpkColor: '#FF0D0D', radius: 0.73 },
      { id: 2, element: 'O', x: -1.162, y: 0, z: 0, cpkColor: '#FF0D0D', radius: 0.73 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 2 },
      { atom1: 0, atom2: 2, order: 2 },
    ],
  },
  {
    id: 'ch4',
    name: 'Methane',
    formula: 'CH₄',
    geometry: 'Tetrahedral',
    bondAngle: '109.5°',
    description: 'Regular tetrahedral geometry. Simplest alkane; primary component of natural gas.',
    dipole: '0 D',
    atoms: [
      { id: 0, element: 'C', x: 0,       y: 0,       z: 0,      cpkColor: '#404040', radius: 0.76 },
      { id: 1, element: 'H', x: 0.628,   y: 0.628,   z: 0.628,  cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 2, element: 'H', x: -0.628,  y: -0.628,  z: 0.628,  cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 3, element: 'H', x: -0.628,  y: 0.628,   z: -0.628, cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 4, element: 'H', x: 0.628,   y: -0.628,  z: -0.628, cpkColor: '#FFFFFF', radius: 0.31 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 },
      { atom1: 0, atom2: 4, order: 1 },
    ],
  },
  {
    id: 'nh3',
    name: 'Ammonia',
    formula: 'NH₃',
    geometry: 'Trigonal Pyramidal',
    bondAngle: '107°',
    description: 'Trigonal pyramidal due to 1 lone pair. Important industrial chemical.',
    dipole: '1.47 D',
    atoms: [
      { id: 0, element: 'N', x: 0,      y: 0.380, z: 0,     cpkColor: '#3050F8', radius: 0.71 },
      { id: 1, element: 'H', x: 0.940,  y: 0,     z: 0,     cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 2, element: 'H', x: -0.470, y: 0,     z: 0.815, cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 3, element: 'H', x: -0.470, y: 0,     z: -0.815,cpkColor: '#FFFFFF', radius: 0.31 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 },
    ],
  },
  {
    id: 'c6h6',
    name: 'Benzene',
    formula: 'C₆H₆',
    geometry: 'Planar Hexagonal',
    bondAngle: '120°',
    description: 'Aromatic ring with delocalised electrons. Fundamental organic chemistry structure.',
    dipole: '0 D',
    atoms: [
      { id: 0,  element: 'C', x: 1.40,  y: 0,     z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 1,  element: 'C', x: 0.70,  y: 1.212, z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 2,  element: 'C', x: -0.70, y: 1.212, z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 3,  element: 'C', x: -1.40, y: 0,     z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 4,  element: 'C', x: -0.70, y: -1.212,z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 5,  element: 'C', x: 0.70,  y: -1.212,z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 6,  element: 'H', x: 2.48,  y: 0,     z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 7,  element: 'H', x: 1.24,  y: 2.147, z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 8,  element: 'H', x: -1.24, y: 2.147, z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 9,  element: 'H', x: -2.48, y: 0,     z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 10, element: 'H', x: -1.24, y: -2.147,z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 11, element: 'H', x: 1.24,  y: -2.147,z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1.5 },
      { atom1: 1, atom2: 2, order: 1.5 },
      { atom1: 2, atom2: 3, order: 1.5 },
      { atom1: 3, atom2: 4, order: 1.5 },
      { atom1: 4, atom2: 5, order: 1.5 },
      { atom1: 5, atom2: 0, order: 1.5 },
      { atom1: 0, atom2: 6, order: 1 },
      { atom1: 1, atom2: 7, order: 1 },
      { atom1: 2, atom2: 8, order: 1 },
      { atom1: 3, atom2: 9, order: 1 },
      { atom1: 4, atom2: 10, order: 1 },
      { atom1: 5, atom2: 11, order: 1 },
    ],
  },
  {
    id: 'hcl',
    name: 'Hydrogen Chloride',
    formula: 'HCl',
    geometry: 'Linear',
    bondAngle: '180°',
    description: 'Diatomic polar molecule. Dissolves in water to form hydrochloric acid.',
    dipole: '1.08 D',
    atoms: [
      { id: 0, element: 'H',  x: -0.627, y: 0, z: 0, cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 1, element: 'Cl', x:  0.627, y: 0, z: 0, cpkColor: '#1FF01F', radius: 0.99 },
    ],
    bonds: [{ atom1: 0, atom2: 1, order: 1 }],
  },
  {
    id: 'so2',
    name: 'Sulfur Dioxide',
    formula: 'SO₂',
    geometry: 'Bent',
    bondAngle: '119°',
    description: 'Bent molecule. Major air pollutant; causes acid rain.',
    dipole: '1.63 D',
    atoms: [
      { id: 0, element: 'S', x: 0,      y: 0,     z: 0,    cpkColor: '#FFFF30', radius: 1.04 },
      { id: 1, element: 'O', x: 1.43,   y: 0.36,  z: 0,    cpkColor: '#FF0D0D', radius: 0.73 },
      { id: 2, element: 'O', x: -1.43,  y: 0.36,  z: 0,    cpkColor: '#FF0D0D', radius: 0.73 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 2 },
      { atom1: 0, atom2: 2, order: 2 },
    ],
  },
  {
    id: 'n2',
    name: 'Nitrogen',
    formula: 'N₂',
    geometry: 'Linear',
    bondAngle: '180°',
    description: 'Triple bond makes it very stable. 78% of atmosphere.',
    dipole: '0 D',
    atoms: [
      { id: 0, element: 'N', x: -0.55, y: 0, z: 0, cpkColor: '#3050F8', radius: 0.71 },
      { id: 1, element: 'N', x:  0.55, y: 0, z: 0, cpkColor: '#3050F8', radius: 0.71 },
    ],
    bonds: [{ atom1: 0, atom2: 1, order: 3 }],
  },
  {
    id: 'o2',
    name: 'Oxygen',
    formula: 'O₂',
    geometry: 'Linear',
    bondAngle: '180°',
    description: 'Diatomic oxygen with a double bond. Essential for aerobic respiration.',
    dipole: '0 D',
    atoms: [
      { id: 0, element: 'O', x: -0.60, y: 0, z: 0, cpkColor: '#FF0D0D', radius: 0.73 },
      { id: 1, element: 'O', x:  0.60, y: 0, z: 0, cpkColor: '#FF0D0D', radius: 0.73 },
    ],
    bonds: [{ atom1: 0, atom2: 1, order: 2 }],
  },
  {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    geometry: 'Tetrahedral C',
    bondAngle: '109.5°',
    description: 'Simple alcohol. Product of fermentation; used as solvent and fuel.',
    dipole: '1.69 D',
    atoms: [
      { id: 0, element: 'C', x: 0,     y: 0,     z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 1, element: 'C', x: 1.54,  y: 0,     z: 0,    cpkColor: '#404040', radius: 0.76 },
      { id: 2, element: 'O', x: 2.0,   y: 1.10,  z: 0,    cpkColor: '#FF0D0D', radius: 0.73 },
      { id: 3, element: 'H', x: -0.38, y: 1.03,  z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 4, element: 'H', x: -0.38, y: -0.51, z: 0.89, cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 5, element: 'H', x: -0.38, y: -0.51, z: -0.89,cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 6, element: 'H', x: 1.92,  y: -1.03, z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 7, element: 'H', x: 1.92,  y: 0.51,  z: 0.89, cpkColor: '#FFFFFF', radius: 0.31 },
      { id: 8, element: 'H', x: 2.95,  y: 1.10,  z: 0,    cpkColor: '#FFFFFF', radius: 0.31 },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 },
      { atom1: 0, atom2: 4, order: 1 },
      { atom1: 0, atom2: 5, order: 1 },
      { atom1: 1, atom2: 6, order: 1 },
      { atom1: 1, atom2: 7, order: 1 },
      { atom1: 2, atom2: 8, order: 1 },
    ],
  },
];

// Solubility rules
export const SOLUBILITY_RULES = [
  { anion: 'NO₃⁻',   always: 'soluble',   exceptions: [] },
  { anion: 'CH₃COO⁻',always: 'soluble',   exceptions: ['Ag⁺'] },
  { anion: 'Cl⁻',    always: 'soluble',   exceptions: ['Ag⁺','Pb²⁺','Hg₂²⁺'] },
  { anion: 'Br⁻',    always: 'soluble',   exceptions: ['Ag⁺','Pb²⁺','Hg₂²⁺'] },
  { anion: 'I⁻',     always: 'soluble',   exceptions: ['Ag⁺','Pb²⁺','Hg₂²⁺'] },
  { anion: 'SO₄²⁻',  always: 'soluble',   exceptions: ['Ba²⁺','Pb²⁺','Ca²⁺','Sr²⁺'] },
  { anion: 'CO₃²⁻',  always: 'insoluble', exceptions: ['Na⁺','K⁺','NH₄⁺'] },
  { anion: 'OH⁻',    always: 'insoluble', exceptions: ['Na⁺','K⁺','Ca²⁺','Ba²⁺'] },
  { anion: 'S²⁻',    always: 'insoluble', exceptions: ['Na⁺','K⁺','NH₄⁺','Mg²⁺','Ca²⁺'] },
  { anion: 'PO₄³⁻',  always: 'insoluble', exceptions: ['Na⁺','K⁺','NH₄⁺'] },
];
