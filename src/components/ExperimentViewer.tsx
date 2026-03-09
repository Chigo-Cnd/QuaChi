import { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  FlaskConical, AlertTriangle, CheckCircle, Download, Bot
} from 'lucide-react';
import type { Experiment } from '@/types';
import { useExperimentStore, useAIChatStore } from '@/store';
import AIChat from './AIChat';
import SimulationCanvas from './SimulationCanvas';
import DataChart from './DataChart';

interface Props {
  experiment: Experiment;
  onBack: () => void;
}

export default function ExperimentViewer({ experiment, onBack }: Props) {
  const { setActiveExperiment, completedSteps, completeStep, observations, addObservation, resetExperiment } = useExperimentStore();
  const { setContext } = useAIChatStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [tab, setTab] = useState<'procedure' | 'theory' | 'data'>('procedure');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setActiveExperiment(experiment.id);
    setContext({ mode: 'experiment', activeExperimentTitle: experiment.title, currentModule: experiment.module });
    return () => {
      resetExperiment();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [experiment.id]);

  const step = experiment.procedure[currentStep];
  const isStepComplete = completedSteps.includes(currentStep);
  const progress = ((currentStep + (isStepComplete ? 1 : 0)) / experiment.procedure.length) * 100;

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current!);
      timerRef.current = null;
      setIsRunning(false);
    } else {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      setIsRunning(true);
    }
  };

  const handleCompleteStep = () => {
    if (step.expectedObservation) addObservation(step.expectedObservation);
    completeStep(currentStep);
    if (currentStep < experiment.procedure.length - 1) {
      setTimeout(() => setCurrentStep(s => s + 1), 300);
    }
  };

  const handleReset = () => {
    resetExperiment();
    setCurrentStep(0);
    setElapsed(0);
    setIsRunning(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const DIFFICULTY_COLOR = { beginner: '#10B981', intermediate: '#F59E0B', advanced: '#EF4444' };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ height: 'calc(100vh - 56px)' }}>

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b flex items-center gap-3 flex-wrap"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-[var(--accent-light)] transition-colors flex-shrink-0">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base truncate">{experiment.title}</h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: DIFFICULTY_COLOR[experiment.difficulty] }}>● {experiment.difficulty}</span>
            <span>·</span>
            <span>{experiment.estimatedMinutes} min</span>
            <span>·</span>
            <span>{experiment.curriculumTags.join(', ')}</span>
          </div>
        </div>
        <button onClick={() => setShowAI(s => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          style={{ background: showAI ? 'var(--accent)' : 'var(--accent-light)', color: showAI ? 'white' : 'var(--accent)' }}>
          <Bot size={16} /> AI Help
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1.5 flex-shrink-0" style={{ background: 'var(--border)' }}>
        <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${progress}%`, background: 'var(--accent)' }} />
      </div>

      {/* ── Main Area ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left: Simulation + Controls */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Simulation Canvas */}
          <div className="flex-shrink-0" style={{ height: '220px' }}>
            <SimulationCanvas experiment={experiment} currentStep={currentStep} isRunning={isRunning} />
          </div>

          {/* Timer + Controls */}
          <div className="flex items-center gap-2 px-4 py-2 border-y flex-shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <span className="font-mono text-sm font-bold" style={{ color: 'var(--accent)' }}>{formatTime(elapsed)}</span>
            <div className="flex gap-1 ml-1">
              <button onClick={toggleTimer}
                className="p-2 rounded-lg transition-colors"
                style={{ background: isRunning ? 'var(--error)' : 'var(--accent)', color: 'white' }}
                title={isRunning ? 'Pause timer' : 'Start timer'}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={handleReset}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <RotateCcw size={16} />
              </button>
            </div>
            <span className="ml-auto text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Step {currentStep + 1} / {experiment.procedure.length}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            {(['procedure', 'theory', 'data'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-medium capitalize transition-colors"
                style={{
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'procedure' && (
              <div className="space-y-3">
                {/* Safety warnings */}
                {experiment.safetyWarnings.length > 0 && (
                  <div className="flex gap-2 p-3 rounded-xl text-sm"
                    style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}>
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Safety:</strong> {experiment.safetyWarnings.join(' • ')}
                    </div>
                  </div>
                )}

                {/* Current step highlight */}
                <div className="p-4 rounded-xl border-2" style={{
                  borderColor: isStepComplete ? 'var(--success)' : 'var(--accent)',
                  background: isStepComplete ? '#D1FAE5' : 'var(--accent-light)',
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    {isStepComplete
                      ? <CheckCircle size={18} style={{ color: 'var(--success)' }} />
                      : <FlaskConical size={18} style={{ color: 'var(--accent)' }} />
                    }
                    <span className="text-xs font-bold uppercase" style={{ color: isStepComplete ? 'var(--success)' : 'var(--accent)' }}>
                      Step {currentStep + 1} of {experiment.procedure.length}
                    </span>
                  </div>
                  <p className="font-medium text-sm mb-3">{step?.instruction}</p>
                  {step?.expectedObservation && (
                    <p className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                      👁 Expected: {step.expectedObservation}
                    </p>
                  )}
                  {!isStepComplete && (
                    <button onClick={handleCompleteStep}
                      className="mt-3 btn-primary text-sm w-full justify-center">
                      Mark Step Complete <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                {/* All steps list */}
                <div className="space-y-2">
                  {experiment.procedure.map((s, i) => (
                    <div key={i}
                      onClick={() => setCurrentStep(i)}
                      className="flex gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-[var(--accent-light)]"
                      style={{
                        background: i === currentStep ? 'var(--accent-light)' : 'var(--surface)',
                        opacity: completedSteps.includes(i) ? 0.6 : 1,
                      }}>
                      <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        style={{
                          background: completedSteps.includes(i) ? 'var(--success)' : i === currentStep ? 'var(--accent)' : 'var(--bg-tertiary)',
                          color: (completedSteps.includes(i) || i === currentStep) ? 'white' : 'var(--text-muted)',
                        }}>
                        {completedSteps.includes(i) ? '✓' : i + 1}
                      </span>
                      <span className="text-sm flex-1">{s.instruction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'theory' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Objectives</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {experiment.objectives.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Background Theory</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {experiment.backgroundTheory}
                  </p>
                </div>
                {experiment.keyEquations.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">Key Equations</h3>
                    <div className="space-y-2">
                      {experiment.keyEquations.map((eq, i) => (
                        <div key={i} className="p-3 rounded-lg font-mono text-sm"
                          style={{ background: 'var(--sim-bg)', color: '#60A5FA', border: '1px solid var(--sim-border)' }}>
                          {eq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-bold mb-2">Apparatus</h3>
                  <ul className="grid grid-cols-2 gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {experiment.apparatus.map((a, i) => <li key={i} className="flex items-center gap-1">• {a}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {tab === 'data' && (
              <div className="space-y-4">
                {observations.length > 0 ? (
                  <div>
                    <h3 className="font-bold mb-2">Recorded Observations</h3>
                    <div className="space-y-2">
                      {observations.map((obs, i) => (
                        <div key={i} className="flex gap-2 p-3 rounded-lg text-sm"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                          {obs}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                    Complete experiment steps to record observations here.
                  </p>
                )}
                {experiment.graphType && <DataChart experimentId={experiment.id} graphType={experiment.graphType} />}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Chat (when open) */}
        {showAI && (
          <div className="w-80 flex-shrink-0 border-l hidden md:flex flex-col"
            style={{ borderColor: 'var(--border)' }}>
            <AIChat embedded />
          </div>
        )}
      </div>
    </div>
  );
}
