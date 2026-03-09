import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  FlaskConical, Atom, Calculator, Bot, FileText,
  Zap, BookOpen, ChevronRight, Star, Globe2
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import Footer from '@/components/Footer';
import { useUIStore } from '@/store';
import { experiments, MODULES } from '@/data/Experiments';

const FEATURES = [
  { icon: FlaskConical, title: '50+ Experiments',   desc: 'Interactive virtual labs across 12 chemistry topics', color: '#3B82F6' },
  { icon: Bot,          title: 'QuaChi AI Tutor',   desc: 'Powered by Claude — explains, guides, and generates reports', color: '#8B5CF6' },
  { icon: Atom,         title: '3D Molecules',       desc: 'WebGL molecular viewer with CPK colors and bond display', color: '#06B6D4' },
  { icon: Calculator,   title: '12 Calculators',     desc: 'Mole, pH, gas law, equilibrium, Nernst and more', color: '#10B981' },
  { icon: Zap,          title: 'Reaction Calculator',desc: 'Balance equations, find limiting reagent, predict yield', color: '#F59E0B' },
  { icon: FileText,     title: 'Lab Reports',        desc: 'AI-generated academic reports with PDF export', color: '#EF4444' },
];

const CURRICULA = ['IB Chemistry', 'AP Chemistry', 'A-Level', 'IGCSE', 'WAEC', 'NECO'];

const STATS = [
  { label: 'Experiments', value: '50+' },
  { label: 'Molecules', value: '10+' },
  { label: 'Calculators', value: '12' },
  { label: 'Curricula', value: '6' },
];

export default function Home() {
  const { sidebarOpen, setSidebarOpen, theme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Head>
        <title>QuaChi — Quantitative Chemistry Laboratory | QuaModels</title>
      </Head>

      {/* ─── Top Navigation ─── */}
      <nav className="sticky top-0 z-40 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--accent-light)] transition-colors"
              aria-label="Open menu"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="QuaChi logo" className="h-8 w-auto" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/experiments" className="hover:text-[var(--accent)] transition-colors">Experiments</Link>
            <Link href="/calculator"  className="hover:text-[var(--accent)] transition-colors">Calculators</Link>
            <Link href="/molecules"   className="hover:text-[var(--accent)] transition-colors">Molecules</Link>
            <Link href="/ai-tutor"    className="hover:text-[var(--accent)] transition-colors">AI Tutor</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link href="/experiments" className="btn-primary text-sm hidden sm:flex">
              Start Lab <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Sidebar ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72" style={{ background: 'var(--bg-secondary)' }}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ─── Hero Section ─── */}
      <main className="flex-1">
        <section className="relative py-20 px-4 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20"
              style={{ background: 'radial-gradient(ellipse, #2563EB 0%, transparent 70%)' }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 border"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent)' }}>
              <Star size={12} fill="currentColor" />
              PhET-style Chemistry Platform by QuaModels
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span style={{ color: 'var(--accent)' }}>Quantitative</span> Chemistry
              <br />Laboratory
            </h1>

            <p className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Interactive experiments, AI tutoring, 3D molecules, and quantitative
              calculations — all in one digital chemistry lab designed for global students.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link href="/experiments" className="btn-primary text-base px-6 py-3">
                <FlaskConical size={18} /> Open Lab
              </Link>
              <Link href="/ai-tutor" className="btn-secondary text-base px-6 py-3">
                <Bot size={18} /> Ask QuaChi AI
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
              {STATS.map(s => (
                <div key={s.label} className="text-center p-4 rounded-xl border"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{s.value}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── Features ─── */}
        <section className="py-16 px-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">Everything You Need</h2>
            <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>
              A complete digital chemistry laboratory in your browser
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl border hover:border-[var(--accent)] transition-all group"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.color + '22' }}>
                    <f.icon size={24} style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Experiment Modules ─── */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">12 Topic Areas</h2>
            <p className="text-center mb-10" style={{ color: 'var(--text-secondary)' }}>
              {experiments.length}+ experiments across the full chemistry curriculum
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MODULES.map(m => {
                const count = experiments.filter(e => e.module === m.id).length;
                return (
                  <Link
                    key={m.id}
                    href={`/experiments?module=${m.id}`}
                    className="p-4 rounded-xl border text-center hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div className="font-semibold text-sm mb-1">{m.label}</div>
                    <div className="text-xs" style={{ color: 'var(--accent)' }}>{count} experiment{count !== 1 ? 's' : ''}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Curriculum Coverage ─── */}
        <section className="py-16 px-4" style={{ background: 'var(--bg-secondary)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <Globe2 size={40} className="mx-auto mb-4" style={{ color: 'var(--accent)' }} />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Global Curriculum Coverage</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Aligned with major international chemistry curricula
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {CURRICULA.map(c => (
                <span key={c} className="px-4 py-2 rounded-full text-sm font-medium border"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">Ready to Experiment?</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Open the virtual lab, ask the AI tutor, and explore chemistry like never before.
            </p>
            <Link href="/experiments" className="btn-primary text-lg px-8 py-4 inline-flex">
              <FlaskConical size={20} /> Open QuaChi Lab
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
