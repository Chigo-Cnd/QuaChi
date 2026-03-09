import { useState } from 'react';
import { FileText, Bot, Download, Plus, CheckCircle, Loader2 } from 'lucide-react';
import { useReportStore, useUserStore } from '@/store';
import { experiments } from '@/data/Experiments';
import type { LabReport } from '@/types';

const SECTIONS = ['objective','introduction','apparatus','chemicals','procedure','results','calculations','discussion','conclusion','references'] as const;
type Section = typeof SECTIONS[number];

function newReport(exp: (typeof experiments)[0], board: string): LabReport {
  return {
    id:             Date.now().toString(),
    title:          `Lab Report: ${exp.title}`,
    experimentId:   exp.id,
    createdAt:      new Date(),
    updatedAt:      new Date(),
    curriculumBoard: board as any,
    mode:            'manual',
    status:          'draft',
    objective:       exp.objectives.join('; '),
    introduction:    '',
    apparatus:       exp.apparatus.join('\n'),
    chemicals:       exp.chemicals.map(c => `${c.name} (${c.formula}) — ${c.amount}`).join('\n'),
    procedure:       exp.procedure.map((s,i) => `${i+1}. ${s.instruction}`).join('\n'),
    results:         '',
    calculations:    '',
    discussion:      '',
    conclusion:      '',
    references:      'IUPAC Nomenclature Guidelines\nRelevant textbook and peer-reviewed sources',
  };
}

export default function ReportEditor() {
  const { reports, activeReportId, addReport, updateReport, setActiveReport } = useReportStore();
  const { curriculumBoard } = useUserStore();
  const [selectedExp, setSelectedExp] = useState('');
  const [activeSection, setActiveSection] = useState<Section>('objective');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAIStatus] = useState('');

  const activeReport = reports.find(r => r.id === activeReportId) ?? null;

  const handleNewReport = () => {
    const exp = experiments.find(e => e.id === selectedExp);
    if (!exp) return;
    const r = newReport(exp, curriculumBoard);
    addReport(r);
    setActiveReport(r.id);
  };

  const handleUpdate = (field: Section, value: string) => {
    if (!activeReportId) return;
    updateReport(activeReportId, { [field]: value, updatedAt: new Date() } as any);
  };

  const handleAIGenerate = async () => {
    if (!activeReport) return;
    const exp = experiments.find(e => e.id === activeReport.experimentId);
    if (!exp) return;
    setIsGenerating(true);
    setAIStatus('Generating report with QuaChi AI...');
    try {
      const res = await fetch('/api/ai/report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment: exp, curriculumBoard: activeReport.curriculumBoard }),
      });
      const data = await res.json();
      if (data.report) {
        const updates: Partial<LabReport> = { mode: 'automated', status: 'reviewed', updatedAt: new Date() };
        for (const [k, v] of Object.entries(data.report)) {
          if (SECTIONS.includes(k as any)) (updates as any)[k] = v as string;
        }
        updateReport(activeReport.id, updates);
        setAIStatus('✓ Report generated!');
      }
    } catch {
      setAIStatus('Error generating report. Check API key.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setAIStatus(''), 3000);
    }
  };

  const handleExportTXT = () => {
    if (!activeReport) return;
    const text = SECTIONS.map(s =>
      `${s.toUpperCase()}\n${'─'.repeat(40)}\n${(activeReport as any)[s]}\n`
    ).join('\n');
    const blob = new Blob([`${activeReport.title}\n\n${text}`], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeReport.title}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (!activeReport) {
    return (
      <div className="p-4 lg:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText size={24} style={{ color: 'var(--accent)' }} />
          <div>
            <h1 className="text-2xl font-black">Lab Reports</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              AI-powered academic chemistry reports
            </p>
          </div>
        </div>

        {/* Existing Reports */}
        {reports.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Your Reports</h2>
            <div className="space-y-2">
              {reports.map(r => (
                <button key={r.id} onClick={() => setActiveReport(r.id)}
                  className="w-full text-left p-4 rounded-xl border hover:border-[var(--accent)] transition-all"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{r.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: r.status === 'final' ? '#D1FAE5' : 'var(--bg-tertiary)', color: r.status === 'final' ? '#065F46' : 'var(--text-muted)' }}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {r.curriculumBoard} · {r.mode} · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* New Report */}
        <div className="p-6 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-bold mb-4">Create New Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Select Experiment
              </label>
              <select value={selectedExp} onChange={e => setSelectedExp(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <option value="">-- Choose experiment --</option>
                {experiments.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>
            <button onClick={handleNewReport} disabled={!selectedExp}
              className="btn-primary w-full justify-center" style={{ opacity: selectedExp ? 1 : 0.5 }}>
              <Plus size={16} /> Create Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0">
      {/* Section nav */}
      <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r overflow-y-auto flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="p-4">
          <button onClick={() => setActiveReport(null)}
            className="text-xs flex items-center gap-1 mb-4 hover:text-[var(--accent)] transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            ← All Reports
          </button>
          <h3 className="font-bold text-sm mb-3 truncate">{activeReport.title}</h3>
          <div className="space-y-1">
            {SECTIONS.map(s => {
              const filled = Boolean((activeReport as any)[s]);
              return (
                <button key={s} onClick={() => setActiveSection(s)}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm capitalize transition-colors"
                  style={{
                    background: activeSection === s ? 'var(--accent-light)' : 'transparent',
                    color:      activeSection === s ? 'var(--accent)' : 'var(--text-secondary)',
                  }}>
                  {filled
                    ? <CheckCircle size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    : <div className="w-3 h-3 rounded-full border flex-shrink-0" style={{ borderColor: 'var(--border)' }} />
                  }
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <span className="font-semibold text-sm capitalize">{activeSection}</span>
          <div className="ml-auto flex gap-2">
            {aiStatus && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {isGenerating && <Loader2 size={10} className="inline animate-spin mr-1" />}
                {aiStatus}
              </span>
            )}
            <button onClick={handleAIGenerate} disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--accent)', color: 'white', opacity: isGenerating ? 0.7 : 1 }}>
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
              AI Generate All
            </button>
            <button onClick={handleExportTXT}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              <Download size={12} /> Export TXT
            </button>
          </div>
        </div>

        {/* Section editor */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-bold text-lg capitalize mb-3">{activeSection}</h2>
            <textarea
              value={(activeReport as any)[activeSection] ?? ''}
              onChange={e => handleUpdate(activeSection, e.target.value)}
              placeholder={`Write the ${activeSection} section here, or use AI Generate to auto-fill...`}
              className="w-full min-h-[400px] px-4 py-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none leading-relaxed"
              style={{
                background:  'var(--surface)',
                borderColor: 'var(--border)',
                color:       'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
