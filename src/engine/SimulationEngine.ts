// ═══════════════════════════════════════════════
// QuaChi Simulation Engine
// Core engine managing experiment state and data
// ═══════════════════════════════════════════════

import type {
  Experiment, SimulationState, SimulationConditions,
  DataPoint, SimulationStatus
} from '@/types';

export type SimulationEvent =
  | 'STATE_CHANGED'
  | 'STEP_CHANGED'
  | 'REACTION_OCCURRED'
  | 'DATA_UPDATED'
  | 'OBSERVATION_ADDED'
  | 'EXPERIMENT_COMPLETE'
  | 'ERROR';

type EventHandler = (data: unknown) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  on(event: SimulationEvent, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  off(event: SimulationEvent, handler: EventHandler) {
    const hs = this.handlers.get(event);
    if (hs) this.handlers.set(event, hs.filter(h => h !== handler));
  }

  emit(event: SimulationEvent, data: unknown) {
    this.handlers.get(event)?.forEach(h => h(data));
  }
}

// ─── Default Conditions ────────────────────────────────
const DEFAULT_CONDITIONS: SimulationConditions = {
  temperature: 298.15,   // 25°C (SATP)
  pressure:    1.0,      // atm
  volume:      1.0,      // L
  pH:          7.0,
  concentrations: {},
};

// ─── Main Simulation Engine ────────────────────────────
export class SimulationEngine {
  private static instance: SimulationEngine;

  public events = new EventBus();
  private state: SimulationState;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private currentExperiment: Experiment | null = null;
  private readonly TICK_RATE = 500; // ms

  private constructor() {
    this.state = this.defaultState();
  }

  static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  private defaultState(): SimulationState {
    return {
      experimentId:  null,
      status:        'idle',
      currentStep:   0,
      totalSteps:    0,
      conditions:    { ...DEFAULT_CONDITIONS, concentrations: {} },
      dataPoints:    [],
      observations:  [],
      startTime:     null,
      elapsed:       0,
    };
  }

  // ── Load Experiment ────────────────────────────────
  loadExperiment(experiment: Experiment): void {
    this.currentExperiment = experiment;
    this.state = {
      ...this.defaultState(),
      experimentId: experiment.id,
      status:       'setup',
      totalSteps:   experiment.procedure.length,
      conditions:   this.initConditions(experiment),
    };
    this.events.emit('STATE_CHANGED', { status: 'setup', experiment });
  }

  private initConditions(experiment: Experiment): SimulationConditions {
    const concentrations: Record<string, number> = {};
    experiment.chemicals.forEach((chem, i) => {
      const key = chem.formula;
      concentrations[key] = 0.1 * (i + 1); // placeholder initial concentrations
    });
    return { ...DEFAULT_CONDITIONS, concentrations };
  }

  // ── State Control ──────────────────────────────────
  start(): void {
    if (!['setup', 'paused'].includes(this.state.status)) return;
    this.state.status = 'running';
    this.state.startTime = Date.now();
    this.startTicker();
    this.events.emit('STATE_CHANGED', { status: 'running' });
  }

  pause(): void {
    if (this.state.status !== 'running') return;
    this.state.status = 'paused';
    this.stopTicker();
    this.events.emit('STATE_CHANGED', { status: 'paused' });
  }

  reset(): void {
    this.stopTicker();
    if (this.currentExperiment) {
      this.loadExperiment(this.currentExperiment);
    } else {
      this.state = this.defaultState();
    }
    this.events.emit('STATE_CHANGED', { status: 'idle' });
  }

  advanceStep(): void {
    if (this.state.currentStep < this.state.totalSteps - 1) {
      this.state.currentStep++;
      this.events.emit('STEP_CHANGED', {
        step:  this.state.currentStep,
        total: this.state.totalSteps,
        instruction: this.currentExperiment?.procedure[this.state.currentStep],
      });
    } else {
      this.complete();
    }
  }

  rewindStep(): void {
    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.events.emit('STEP_CHANGED', { step: this.state.currentStep });
    }
  }

  // ── Ticker ────────────────────────────────────────
  private startTicker(): void {
    this.tickInterval = setInterval(() => this.tick(), this.TICK_RATE);
  }

  private stopTicker(): void {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick(): void {
    if (this.state.status !== 'running') return;

    const now = Date.now();
    this.state.elapsed = this.state.startTime
      ? (now - this.state.startTime) / 1000
      : 0;

    // Update simulated conditions (simplified physics)
    this.updateConditions();

    // Record data point
    const dp: DataPoint = {
      time:          this.state.elapsed,
      temperature:   this.state.conditions.temperature,
      pressure:      this.state.conditions.pressure,
      pH:            this.state.conditions.pH,
      concentrations: { ...this.state.conditions.concentrations },
      observations:  [],
    };
    this.state.dataPoints.push(dp);
    this.events.emit('DATA_UPDATED', dp);
  }

  private updateConditions(): void {
    // Simulate gradual changes based on current experiment step
    const step = this.currentExperiment?.procedure[this.state.currentStep];
    if (!step) return;

    if (step.userAction === 'add-reagent') {
      // Simulate reaction: pH drift, concentration change
      this.state.conditions.pH = Math.max(
        0,
        Math.min(14, this.state.conditions.pH + (Math.random() - 0.5) * 0.05)
      );
    }

    if (step.userAction === 'adjust-slider') {
      // Temperature increasing scenario
      this.state.conditions.temperature = Math.min(
        373.15,
        this.state.conditions.temperature + 0.5
      );
    }
  }

  private complete(): void {
    this.stopTicker();
    this.state.status = 'complete';
    this.events.emit('EXPERIMENT_COMPLETE', {
      experimentId: this.state.experimentId,
      dataPoints:   this.state.dataPoints,
      observations: this.state.observations,
    });
  }

  // ── Condition Setters ─────────────────────────────
  setTemperature(T: number): void {
    this.state.conditions.temperature = T;
  }

  setPressure(P: number): void {
    this.state.conditions.pressure = P;
  }

  setVolume(V: number): void {
    this.state.conditions.volume = V;
  }

  addObservation(obs: string): void {
    this.state.observations.push(obs);
    this.events.emit('OBSERVATION_ADDED', obs);
  }

  // ── Getters ───────────────────────────────────────
  getState(): SimulationState { return { ...this.state }; }
  getStatus(): SimulationStatus { return this.state.status; }
  getCurrentStep(): number { return this.state.currentStep; }
  getDataPoints(): DataPoint[] { return [...this.state.dataPoints]; }
  getConditions(): SimulationConditions { return { ...this.state.conditions }; }

  getTimeSeries(variable: string): { x: number; y: number }[] {
    return this.state.dataPoints.map(dp => ({
      x: dp.time,
      y: variable === 'pH'          ? dp.pH
       : variable === 'temperature' ? dp.temperature
       : variable === 'pressure'    ? dp.pressure
       : dp.concentrations[variable] ?? 0,
    }));
  }

  exportCSV(): string {
    if (this.state.dataPoints.length === 0) return 'No data';
    const headers = ['time', 'temperature', 'pressure', 'pH',
      ...Object.keys(this.state.dataPoints[0].concentrations)].join(',');
    const rows = this.state.dataPoints.map(dp =>
      [dp.time, dp.temperature, dp.pressure, dp.pH,
       ...Object.values(dp.concentrations)].join(',')
    );
    return [headers, ...rows].join('\n');
  }
}

// Singleton export
export const simulationEngine = SimulationEngine.getInstance();
