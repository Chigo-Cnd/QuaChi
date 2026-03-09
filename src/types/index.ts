// ═══════════════════════════════════════════════
// QuaChi — Shared TypeScript Types
// ═══════════════════════════════════════════════

export type Theme = 'light' | 'dark' | 'grey';
export type CurriculumBoard = 'IB' | 'AP' | 'ALevel' | 'IGCSE' | 'WAEC' | 'General';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type SimulationStatus = 'idle' | 'setup' | 'running' | 'paused' | 'complete' | 'error';
export type ReportMode = 'automated' | 'manual';
export type AIMode = 'general' | 'experiment' | 'calculator' | 'report';

// ─── Element ────────────────────────────────────
export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  period: number;
  group: number | null;
  block: 's' | 'p' | 'd' | 'f';
  category: string;
  electronConfiguration: string;
  electronegativity: number | null;
  oxidationStates: number[];
  meltingPoint: number | null;
  boilingPoint: number | null;
  density: number | null;
  standardState: 'solid' | 'liquid' | 'gas';
  cpkColor: string;
  tableColor: string;
  radioactive: boolean;
  uses: string[];
  funFact: string;
}

// ─── Experiment ──────────────────────────────────
export interface ProcedureStep {
  stepNumber: number;
  instruction: string;
  userAction: 'observe' | 'add-reagent' | 'adjust-slider' | 'start-timer' | 'record-data' | 'none';
  expectedObservation?: string;
  hint?: string;
}

export interface Experiment {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  curriculumTags: CurriculumBoard[];
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  objectives: string[];
  apparatus: string[];
  chemicals: { name: string; formula: string; amount: string }[];
  safetyWarnings: string[];
  backgroundTheory: string;
  procedure: ProcedureStep[];
  keyEquations: string[];
  expectedResults: string;
  graphType: string | null;
  aiContext: string;
}

// ─── Simulation ──────────────────────────────────
export interface SimulationConditions {
  temperature: number;     // K
  pressure: number;        // atm
  volume: number;          // L
  pH: number;
  concentrations: Record<string, number>;
}

export interface DataPoint {
  time: number;
  temperature: number;
  pressure: number;
  pH: number;
  concentrations: Record<string, number>;
  observations: string[];
}

export interface SimulationState {
  experimentId: string | null;
  status: SimulationStatus;
  currentStep: number;
  totalSteps: number;
  conditions: SimulationConditions;
  dataPoints: DataPoint[];
  observations: string[];
  startTime: number | null;
  elapsed: number;
}

// ─── Calculator ──────────────────────────────────
export interface CalculationStep {
  stepNumber: number;
  description: string;
  expression: string;
  result?: number;
  unit?: string;
}

export interface CalculatorResult {
  value: number;
  unit: string;
  steps: CalculationStep[];
  formula: string;
}

// ─── AI Chat ─────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIContext {
  mode: AIMode;
  curriculumBoard: CurriculumBoard;
  activeExperimentTitle?: string;
  activeCalculator?: string;
  currentModule?: string;
}

// ─── Report ──────────────────────────────────────
export interface ReportSection {
  title: string;
  content: string;
  isAIGenerated: boolean;
}

export interface LabReport {
  id: string;
  title: string;
  experimentId: string;
  createdAt: Date;
  updatedAt: Date;
  curriculumBoard: CurriculumBoard;
  mode: ReportMode;
  status: 'draft' | 'reviewed' | 'final';
  objective: string;
  introduction: string;
  apparatus: string;
  chemicals: string;
  procedure: string;
  results: string;
  calculations: string;
  discussion: string;
  conclusion: string;
  references: string;
}

// ─── Molecule ─────────────────────────────────────
export interface AtomNode {
  id: number;
  element: string;
  x: number;
  y: number;
  z: number;
  cpkColor: string;
  radius: number;
}

export interface BondEdge {
  atom1: number;
  atom2: number;
  order: 1 | 2 | 3 | 1.5;
}

export interface MoleculeDefinition {
  id: string;
  name: string;
  formula: string;
  geometry: string;
  bondAngle: string;
  atoms: AtomNode[];
  bonds: BondEdge[];
  description: string;
  dipole: string;
}

// ─── Reaction ─────────────────────────────────────
export interface ReactionSpecies {
  formula: string;
  coefficient: number;
  state: 'aq' | 's' | 'l' | 'g';
  molarMass?: number;
}

export interface BalancedReaction {
  reactants: ReactionSpecies[];
  products: ReactionSpecies[];
  balancedString: string;
  isBalanced: boolean;
}

export interface LimitingReagentResult {
  limitingReagent: string;
  theoreticalYieldMoles: number;
  theoreticalYieldGrams: number;
  excessReagent: string;
  excessMoles: number;
  steps: CalculationStep[];
}
