import { useState } from 'react';
import { Calculator, ChevronRight, Copy, Check } from 'lucide-react';
import {
  idealGas, calcMolarity, calcMoles, dilutionCalc,
  calcPH, calcWeakAcidPH, hendersonHasselbalch,
  nernstEquation, cellPotential, getMolarMass, percentYield,
  boylesLaw, charlesLaw
} from '@/utils/EquationBalancer';
import { balanceEquation } from '@/utils/EquationBalancer';
import { CONSTANTS, KA_VALUES, ELECTRODE_POTENTIALS } from '@/data/ChemistryDatabase';

const CALCULATORS = [
  { id: 'moles',        label: 'Moles',              icon: '⚗', color: '#3B82F6' },
  { id: 'molarity',     label: 'Molarity',           icon: '🧪', color: '#8B5CF6' },
  { id: 'gas',          label: 'Gas Laws (PV=nRT)',  icon: '💨', color: '#06B6D4' },
  { id: 'ph',           label: 'pH Calculator',      icon: '🔬', color: '#10B981' },
  { id: 'equation',     label: 'Equation Balancer',  icon: '⚖', color: '#F59E0B' },
  { id: 'dilution',     label: 'Dilution (C₁V₁=C₂V₂)', icon: '💧', color: '#6366F1' },
  { id: 'yield',        label: 'Percent Yield',      icon: '📊', color: '#EF4444' },
  { id: 'nernst',       label: 'Nernst Equation',    icon: '⚡', color: '#F97316' },
  { id: 'electrode',    label: 'Cell Potential',     icon: '🔋', color: '#84CC16' },
  { id: 'buffer',       label: 'Buffer pH (H-H)',    icon: '🧫', color: '#EC4899' },
  { id: 'boyles',       label: "Boyle's Law",        icon: '🫙', color: '#14B8A6' },
  { id: 'enthalpy',     label: 'Molar Mass',         icon: '🔢', color: '#A855F7' },
];

interface CalcState {
  inputs: Record<string, string>;
  result: string;
  steps: string[];
  error: string;
}

function useCalcState(): [CalcState, (k: string, v: string) => void, () => void, (r: string, s: string[]) => void] {
  const [state, setState] = useState<CalcState>({ inputs: {}, result: '', steps: [], error: '' });
  const setInput = (k: string, v: string) =>
    setState(s => ({ ...s, inputs: { ...s.inputs, [k]: v }, error: '' }));
  const reset = () => setState({ inputs: {}, result: '', steps: [], error: '' });
  const setResult = (r: string, steps: string[]) =>
    setState(s => ({ ...s, result: r, steps, error: '' }));
  return [state, setInput, reset, setResult];
}

function InputField({ label, value, onChange, unit, placeholder }:
  { label: string; value: string; onChange: (v: string) => void; unit?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '0'}
          className="flex-1 px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[var(--accent)] transition-colors"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
        {unit && <span className="px-3 py-2.5 rounded-lg text-sm flex items-center"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function ResultBox({ result, steps }: { result: string; steps: string[] }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="mt-4 p-4 rounded-xl border-2" style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase" style={{ color: 'var(--accent)' }}>Result</span>
        <button onClick={copy} className="p-1 rounded transition-colors" title="Copy result">
          {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>
      <div className="font-mono text-lg font-bold" style={{ color: 'var(--accent)' }}>{result}</div>
      {steps.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {steps.map((s, i) => (
            <div key={i} className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              {i + 1}. {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Individual Calculator Components ───────────────────

function MolesCalc() {
  const [state, setInput, reset, setResult] = useCalcState();
  const calc = () => {
    const m = parseFloat(state.inputs.mass ?? '0');
    const M = parseFloat(state.inputs.molarMass ?? '0') || getMolarMass(state.inputs.formula ?? '');
    if (!M) return;
    const n = m / M;
    setResult(`n = ${n.toFixed(4)} mol`, [`n = m / M`, `n = ${m} / ${M}`, `n = ${n.toFixed(4)} mol`]);
  };
  return (
    <div className="space-y-4">
      <InputField label="Mass (m)" value={state.inputs.mass ?? ''} onChange={v => setInput('mass', v)} unit="g" />
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Formula (or enter M below)</label>
        <input type="text" value={state.inputs.formula ?? ''} onChange={e => setInput('formula', e.target.value)}
          placeholder="e.g. NaCl" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[var(--accent)] transition-colors"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
      </div>
      <InputField label="Molar Mass (M) — auto-calculated if formula given" value={state.inputs.molarMass ?? ''} onChange={v => setInput('molarMass', v)} unit="g/mol" />
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate Moles</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function MolarityCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const calc = () => {
    const n = parseFloat(state.inputs.moles ?? '0');
    const V = parseFloat(state.inputs.volume ?? '0');
    if (!V) return;
    const M = n / V;
    setResult(`M = ${M.toFixed(4)} mol/L`, [`M = n / V`, `M = ${n} / ${V}`, `M = ${M.toFixed(4)} mol/L`]);
  };
  return (
    <div className="space-y-4">
      <InputField label="Moles of solute (n)" value={state.inputs.moles ?? ''} onChange={v => setInput('moles', v)} unit="mol" />
      <InputField label="Volume of solution (V)" value={state.inputs.volume ?? ''} onChange={v => setInput('volume', v)} unit="L" />
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate Molarity</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function GasLawCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const [unknown, setUnknown] = useState<'P'|'V'|'n'|'T'>('V');
  const R = CONSTANTS.R_ATM;
  const calc = () => {
    const P = unknown === 'P' ? 0 : parseFloat(state.inputs.P ?? '1');
    const V = unknown === 'V' ? 0 : parseFloat(state.inputs.V ?? '1');
    const n = unknown === 'n' ? 0 : parseFloat(state.inputs.n ?? '1');
    const T = unknown === 'T' ? 0 : (parseFloat(state.inputs.T ?? '298') + (state.inputs.unit === 'C' ? 273.15 : 0));
    const res = idealGas(P, V, n, T);
    const val = res[unknown];
    setResult(`${unknown} = ${val.toFixed(4)} ${unknown === 'P' ? 'atm' : unknown === 'V' ? 'L' : unknown === 'n' ? 'mol' : 'K'}`,
      [`PV = nRT`, `R = ${R} L·atm/mol·K`, `${unknown} = ${val.toFixed(4)}`]);
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Solve for</label>
        <div className="grid grid-cols-4 gap-2">
          {(['P','V','n','T'] as const).map(u => (
            <button key={u} onClick={() => setUnknown(u)}
              className="py-2 rounded-lg text-sm font-bold transition-colors"
              style={{ background: unknown === u ? 'var(--accent)' : 'var(--surface)', color: unknown === u ? 'white' : 'var(--text-secondary)' }}>
              {u}
            </button>
          ))}
        </div>
      </div>
      {['P','V','n','T'].filter(u => u !== unknown).map(u => (
        <InputField key={u} label={u === 'P' ? 'Pressure (atm)' : u === 'V' ? 'Volume (L)' : u === 'n' ? 'Moles (mol)' : 'Temperature (K)'}
          value={state.inputs[u] ?? ''} onChange={v => setInput(u, v)} unit={u === 'P' ? 'atm' : u === 'V' ? 'L' : u === 'n' ? 'mol' : 'K'} />
      ))}
      <button onClick={calc} className="btn-primary w-full justify-center">Solve PV = nRT</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function PHCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const [type, setType] = useState<'strong'|'weak'|'buffer'>('strong');
  const calc = () => {
    if (type === 'strong') {
      const c = parseFloat(state.inputs.conc ?? '0');
      const isAcid = state.inputs.isAcid !== 'base';
      const pH = isAcid ? calcPH(c) : 14 - calcPH(c);
      setResult(`pH = ${pH.toFixed(2)}`, [`pH = -log[H⁺]`, `pH = -log(${c})`, `pH = ${pH.toFixed(2)}`]);
    } else if (type === 'weak') {
      const Ka = parseFloat(state.inputs.Ka ?? '1.74e-5');
      const c  = parseFloat(state.inputs.conc ?? '0.1');
      const pH = calcWeakAcidPH(Ka, c);
      setResult(`pH = ${pH.toFixed(2)}`, [`Ka = [H⁺][A⁻]/[HA]`, `x = √(Ka × C)`, `pH = ${pH.toFixed(2)}`]);
    } else {
      const pKa  = parseFloat(state.inputs.pKa ?? '4.76');
      const cB   = parseFloat(state.inputs.cBase ?? '0.1');
      const cA   = parseFloat(state.inputs.cAcid ?? '0.1');
      const pH   = hendersonHasselbalch(pKa, cB, cA);
      setResult(`pH = ${pH.toFixed(2)}`, [`pH = pKa + log([A⁻]/[HA])`, `pH = ${pKa} + log(${cB}/${cA})`, `pH = ${pH.toFixed(2)}`]);
    }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(['strong','weak','buffer'] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            className="py-2 rounded-lg text-xs font-medium capitalize transition-colors"
            style={{ background: type === t ? 'var(--accent)' : 'var(--surface)', color: type === t ? 'white' : 'var(--text-secondary)' }}>
            {t === 'buffer' ? 'Buffer (H-H)' : `${t} acid`}
          </button>
        ))}
      </div>
      {type === 'strong' && <>
        <InputField label="Concentration (mol/L)" value={state.inputs.conc ?? ''} onChange={v => setInput('conc', v)} unit="M" />
        <div className="flex gap-2">
          <button onClick={() => setInput('isAcid', 'acid')} className="flex-1 py-2 rounded-lg text-sm transition-colors"
            style={{ background: state.inputs.isAcid !== 'base' ? '#DBEAFE' : 'var(--surface)', color: '#1D4ED8' }}>Acid</button>
          <button onClick={() => setInput('isAcid', 'base')} className="flex-1 py-2 rounded-lg text-sm transition-colors"
            style={{ background: state.inputs.isAcid === 'base' ? '#D1FAE5' : 'var(--surface)', color: '#065F46' }}>Base</button>
        </div>
      </>}
      {type === 'weak' && <>
        <InputField label="Ka value" value={state.inputs.Ka ?? ''} onChange={v => setInput('Ka', v)} placeholder="e.g. 1.74e-5" />
        <InputField label="Concentration (mol/L)" value={state.inputs.conc ?? ''} onChange={v => setInput('conc', v)} unit="M" />
      </>}
      {type === 'buffer' && <>
        <InputField label="pKa of weak acid" value={state.inputs.pKa ?? ''} onChange={v => setInput('pKa', v)} />
        <InputField label="[A⁻] base concentration" value={state.inputs.cBase ?? ''} onChange={v => setInput('cBase', v)} unit="M" />
        <InputField label="[HA] acid concentration" value={state.inputs.cAcid ?? ''} onChange={v => setInput('cAcid', v)} unit="M" />
      </>}
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate pH</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function EquationBalancerCalc() {
  const [eq, setEq] = useState('');
  const [result, setResult] = useState<ReturnType<typeof balanceEquation> | null>(null);
  const calc = () => { if (eq.trim()) setResult(balanceEquation(eq)); };
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Enter unbalanced equation (use -&gt; for arrow)
        </label>
        <input type="text" value={eq} onChange={e => setEq(e.target.value)} onKeyDown={e => e.key === 'Enter' && calc()}
          placeholder="e.g. H2 + O2 -> H2O" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[var(--accent)] transition-colors"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
      </div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Examples: H2 + O2 -&gt; H2O &nbsp;|&nbsp; Fe + HCl -&gt; FeCl2 + H2 &nbsp;|&nbsp; Al + O2 -&gt; Al2O3
      </div>
      <button onClick={calc} className="btn-primary w-full justify-center">Balance Equation</button>
      {result && (
        <div className="mt-4 p-4 rounded-xl border-2" style={{ borderColor: result.isBalanced ? 'var(--success)' : '#EF4444', background: result.isBalanced ? '#D1FAE5' : '#FEE2E2' }}>
          <div className="font-mono text-base font-bold" style={{ color: result.isBalanced ? 'var(--success)' : '#DC2626' }}>
            {result.balancedString}
          </div>
          <div className="text-xs mt-2" style={{ color: result.isBalanced ? '#065F46' : '#991B1B' }}>
            {result.isBalanced ? '✓ Balanced' : '⚠ Could not fully balance — check formula'}
          </div>
        </div>
      )}
    </div>
  );
}

function DilutionCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const [unknown, setUnknown] = useState<'C1'|'V1'|'C2'|'V2'>('V2');
  const calc = () => {
    const vals = { C1: parseFloat(state.inputs.C1 ?? '0'), V1: parseFloat(state.inputs.V1 ?? '0'),
                   C2: parseFloat(state.inputs.C2 ?? '0'), V2: parseFloat(state.inputs.V2 ?? '0') };
    const res = dilutionCalc(vals.C1, vals.V1, vals.C2, vals.V2);
    setResult(`${unknown} = ${res.toFixed(4)} ${unknown.startsWith('C') ? 'mol/L' : 'L'}`,
      [`C₁V₁ = C₂V₂`, `${unknown} = ${res.toFixed(4)}`]);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {(['C1','V1','C2','V2'] as const).map(u => (
          <button key={u} onClick={() => setUnknown(u)}
            className="py-2 rounded-lg text-sm font-bold transition-colors"
            style={{ background: unknown === u ? 'var(--accent)' : 'var(--surface)', color: unknown === u ? 'white' : 'var(--text-secondary)' }}>
            {u}
          </button>
        ))}
      </div>
      {['C1','V1','C2','V2'].filter(u => u !== unknown).map(u => (
        <InputField key={u} label={u === 'C1' ? 'C₁ (initial conc.)' : u === 'V1' ? 'V₁ (initial vol.)' : u === 'C2' ? 'C₂ (final conc.)' : 'V₂ (final vol.)'}
          value={state.inputs[u] ?? ''} onChange={v => setInput(u, v)} unit={u.startsWith('C') ? 'M' : 'L'} />
      ))}
      <button onClick={calc} className="btn-primary w-full justify-center">Solve C₁V₁ = C₂V₂</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function YieldCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const calc = () => {
    const actual = parseFloat(state.inputs.actual ?? '0');
    const theoretical = parseFloat(state.inputs.theoretical ?? '0');
    const pct = percentYield(actual, theoretical);
    setResult(`% yield = ${pct.toFixed(2)}%`, [`% yield = (actual / theoretical) × 100`, `= (${actual} / ${theoretical}) × 100`, `= ${pct.toFixed(2)}%`]);
  };
  return (
    <div className="space-y-4">
      <InputField label="Actual yield" value={state.inputs.actual ?? ''} onChange={v => setInput('actual', v)} unit="g" />
      <InputField label="Theoretical yield" value={state.inputs.theoretical ?? ''} onChange={v => setInput('theoretical', v)} unit="g" />
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate % Yield</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function NernstCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const calc = () => {
    const E0 = parseFloat(state.inputs.E0 ?? '1.1');
    const n  = parseFloat(state.inputs.n  ?? '2');
    const Q  = parseFloat(state.inputs.Q  ?? '1');
    const T  = parseFloat(state.inputs.T  ?? '298.15');
    const E  = nernstEquation(E0, n, Q, T);
    setResult(`E = ${E.toFixed(4)} V`, [`E = E° - (RT/nF)ln Q`, `E = ${E0} - (${(8.314*T/(n*96485)).toFixed(5)})ln(${Q})`, `E = ${E.toFixed(4)} V`]);
  };
  return (
    <div className="space-y-4">
      <InputField label="Standard potential E° (V)" value={state.inputs.E0 ?? ''} onChange={v => setInput('E0', v)} unit="V" />
      <InputField label="Electrons transferred (n)" value={state.inputs.n ?? ''} onChange={v => setInput('n', v)} />
      <InputField label="Reaction quotient Q" value={state.inputs.Q ?? ''} onChange={v => setInput('Q', v)} />
      <InputField label="Temperature T" value={state.inputs.T ?? ''} onChange={v => setInput('T', v)} unit="K" />
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate E (Nernst)</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function CellPotentialCalc() {
  const [state, setInput, , setResult] = useCalcState();
  const calc = () => {
    const Ec = parseFloat(state.inputs.cathode ?? '0');
    const Ea = parseFloat(state.inputs.anode   ?? '0');
    const E  = cellPotential(Ec, Ea);
    const dG = -parseFloat(state.inputs.n ?? '2') * 96485 * E / 1000;
    setResult(`E°cell = ${E.toFixed(3)} V ${E > 0 ? '(spontaneous ✓)' : '(non-spontaneous ✗)'}`,
      [`E°cell = E°cathode - E°anode`, `= ${Ec} - (${Ea})`, `= ${E.toFixed(3)} V`, `ΔG° = -nFE° = ${dG.toFixed(1)} kJ/mol`]);
  };
  return (
    <div className="space-y-4">
      <InputField label="E° cathode (reduction)" value={state.inputs.cathode ?? ''} onChange={v => setInput('cathode', v)} unit="V" />
      <InputField label="E° anode (reduction)" value={state.inputs.anode ?? ''} onChange={v => setInput('anode', v)} unit="V" />
      <InputField label="Electrons transferred (n)" value={state.inputs.n ?? ''} onChange={v => setInput('n', v)} />
      <div className="text-xs p-3 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
        Reference: Zn²⁺/Zn = −0.76 V &nbsp;|&nbsp; Cu²⁺/Cu = +0.34 V &nbsp;|&nbsp; Ag⁺/Ag = +0.80 V
      </div>
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate Cell Potential</button>
      <ResultBox result={state.result} steps={state.steps} />
    </div>
  );
}

function MolarMassCalc() {
  const [formula, setFormula] = useState('');
  const [result, setResult]   = useState('');
  const calc = () => {
    const M = getMolarMass(formula);
    setResult(`M(${formula}) = ${M.toFixed(3)} g/mol`);
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Chemical Formula</label>
        <input type="text" value={formula} onChange={e => setFormula(e.target.value)} onKeyDown={e => e.key === 'Enter' && calc()}
          placeholder="e.g. H2SO4 or NaCl" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[var(--accent)] transition-colors"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
      </div>
      <button onClick={calc} className="btn-primary w-full justify-center">Calculate Molar Mass</button>
      {result && (
        <div className="p-4 rounded-xl border-2 font-mono text-lg font-bold" style={{ borderColor: 'var(--accent)', background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {result}
        </div>
      )}
    </div>
  );
}

const CALC_COMPONENTS: Record<string, () => JSX.Element> = {
  moles:     MolesCalc,
  molarity:  MolarityCalc,
  gas:       GasLawCalc,
  ph:        PHCalc,
  equation:  EquationBalancerCalc,
  dilution:  DilutionCalc,
  yield:     YieldCalc,
  nernst:    NernstCalc,
  electrode: CellPotentialCalc,
  buffer:    PHCalc,
  boyles:    GasLawCalc,
  enthalpy:  MolarMassCalc,
};

export default function CalculatorWorkspace() {
  const [activeCalc, setActiveCalc] = useState('moles');
  const CalcComponent = CALC_COMPONENTS[activeCalc] ?? MolesCalc;

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0">
      {/* Sidebar list */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r overflow-y-auto flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="p-4">
          <h2 className="font-bold text-sm uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Calculators</h2>
          <div className="flex flex-wrap lg:flex-col gap-2">
            {CALCULATORS.map(c => (
              <button key={c.id} onClick={() => setActiveCalc(c.id)}
                className="lg:w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: activeCalc === c.id ? 'var(--accent)' : 'var(--surface)',
                  color:      activeCalc === c.id ? 'white' : 'var(--text-primary)',
                  border:     `1px solid ${activeCalc === c.id ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                <span>{c.icon}</span>
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'var(--accent-light)' }}>
              {CALCULATORS.find(c => c.id === activeCalc)?.icon}
            </div>
            <div>
              <h2 className="font-bold">{CALCULATORS.find(c => c.id === activeCalc)?.label}</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter values to calculate</p>
            </div>
          </div>
          <CalcComponent />
        </div>
      </div>
    </div>
  );
}
