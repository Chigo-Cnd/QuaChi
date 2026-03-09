import { useState, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Search, Filter, Clock, BookOpen } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import ExperimentViewer from '@/components/ExperimentViewer';
import { experiments, MODULES, getExperimentsByModule } from '@/data/Experiments';
import type { Experiment } from '@/types';

const DIFFICULTY_COLORS = {
  beginner:     { bg: '#D1FAE5', text: '#065F46' },
  intermediate: { bg: '#FEF3C7', text: '#92400E' },
  advanced:     { bg: '#FEE2E2', text: '#991B1B' },
};

export default function ExperimentsPage() {
  const router = useRouter();
  const moduleFilter = router.query.module as string | undefined;

  const [selectedModule, setSelectedModule] = useState(moduleFilter ?? 'all');
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [activeExperiment, setActiveExperiment] = useState<Experiment | null>(null);

  const filtered = useMemo(() => {
    return experiments.filter(e => {
      if (selectedModule !== 'all' && e.module !== selectedModule) return false;
      if (difficulty !== 'all' && e.difficulty !== difficulty) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) &&
          !e.subtitle.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [selectedModule, difficulty, search]);

  if (activeExperiment) {
    return (
      <AppLayout title={activeExperiment.title}>
        <ExperimentViewer
          experiment={activeExperiment}
          onBack={() => setActiveExperiment(null)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Experiments">
      <Head><title>Experiments — QuaChi</title></Head>

      <div className="p-4 lg:p-6 max-w-full">
        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-1">Experiment Library</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {experiments.length} interactive virtual chemistry experiments
          </p>
        </div>

        {/* ─── Filters ─── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search experiments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[var(--accent)]"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Difficulty filter */}
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="px-3 py-2.5 rounded-lg border text-sm outline-none cursor-pointer"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* ─── Module Tabs (scrollable) ─── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedModule('all')}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              background: selectedModule === 'all' ? 'var(--accent)' : 'var(--surface)',
              color:      selectedModule === 'all' ? 'white' : 'var(--text-secondary)',
              border:     `1px solid ${selectedModule === 'all' ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            All ({experiments.length})
          </button>
          {MODULES.map(m => {
            const count = experiments.filter(e => e.module === m.id).length;
            const active = selectedModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: active ? 'var(--accent)' : 'var(--surface)',
                  color:      active ? 'white' : 'var(--text-secondary)',
                  border:     `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {m.label} ({count})
              </button>
            );
          })}
        </div>

        {/* ─── Results Count ─── */}
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Showing {filtered.length} experiment{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* ─── Experiment Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(exp => {
            const diffStyle = DIFFICULTY_COLORS[exp.difficulty];
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp)}
                className="text-left p-5 rounded-2xl border hover:border-[var(--accent)] hover:shadow-lg transition-all group"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                {/* Module tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    {MODULES.find(m => m.id === exp.module)?.label ?? exp.module}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: diffStyle.bg, color: diffStyle.text }}>
                    {exp.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base mb-1 group-hover:text-[var(--accent)] transition-colors leading-tight">
                  {exp.title}
                </h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {exp.subtitle}
                </p>

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {exp.estimatedMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} /> {exp.procedure.length} steps
                  </span>
                  <span className="ml-auto font-medium" style={{ color: 'var(--accent)' }}>
                    Start →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-3">🔬</p>
            <p className="font-semibold">No experiments found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
