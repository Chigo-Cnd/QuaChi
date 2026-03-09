import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FlaskConical, Calculator, Atom, Bot, FileText,
  Menu, X, ChevronLeft
} from 'lucide-react';
import Sidebar from './Sidebar';
import ThemeSwitcher from './ThemeSwitcher';
import Footer from './Footer';
import { useUIStore } from '@/store';

interface Props {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

const NAV_TABS = [
  { href: '/experiments', icon: FlaskConical, label: 'Lab'       },
  { href: '/calculator',  icon: Calculator,  label: 'Calc'      },
  { href: '/molecules',   icon: Atom,        label: 'Molecules' },
  { href: '/ai-tutor',    icon: Bot,         label: 'AI'        },
  { href: '/reports',     icon: FileText,    label: 'Reports'   },
];

export default function AppLayout({ children, title, showBack }: Props) {
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ─── Top Bar ─── */}
      <header className="sticky top-0 z-40 h-14 border-b flex items-center px-4 gap-3"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-[var(--accent-light)] transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {showBack && (
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[var(--accent-light)] transition-colors flex items-center gap-1 text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}

        <Link href="/" className="flex items-center gap-2 mr-auto">
          <img src="/logo.svg" alt="QuaChi" className="h-7 w-auto" />
          {title && (
            <span className="hidden sm:block text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              / {title}
            </span>
          )}
        </Link>

        <ThemeSwitcher />
      </header>

      {/* ─── Body ─── */}
      <div className="flex flex-1 relative overflow-hidden">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 border-r flex-shrink-0 overflow-y-auto"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <Sidebar />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto shadow-2xl"
              style={{ background: 'var(--bg-secondary)' }}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0 pb-20 lg:pb-4">
          {children}
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        {NAV_TABS.map(tab => {
          const active = router.pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
