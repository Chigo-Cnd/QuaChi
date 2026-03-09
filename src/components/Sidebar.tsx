import Link from 'next/link';
import { useRouter } from 'next/router';
import { X, FlaskConical, Calculator, Atom, Bot, FileText, Home, BookOpen } from 'lucide-react';
import { MODULES } from '@/data/Experiments';

interface Props {
  onClose?: () => void;
}

const TOP_NAV = [
  { href: '/',            icon: Home,        label: 'Home'        },
  { href: '/experiments', icon: FlaskConical, label: 'Experiments' },
  { href: '/calculator',  icon: Calculator,   label: 'Calculators' },
  { href: '/molecules',   icon: Atom,         label: '3D Molecules'},
  { href: '/ai-tutor',    icon: Bot,          label: 'QuaChi AI'   },
  { href: '/reports',     icon: FileText,     label: 'Lab Reports' },
];

export default function Sidebar({ onClose }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full p-4 gap-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Navigation
        </span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--accent-light)] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Nav */}
      {TOP_NAV.map(item => {
        const active = router.pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: active ? 'var(--accent-light)' : 'transparent',
              color:      active ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <item.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
            {item.label}
          </Link>
        );
      })}

      {/* Divider */}
      <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />

      {/* Module shortcuts */}
      <span className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
        Experiment Modules
      </span>
      {MODULES.map(m => (
        <Link
          key={m.id}
          href={`/experiments?module=${m.id}`}
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <BookOpen size={14} />
          {m.label}
        </Link>
      ))}

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        <p>© The QuaModels</p>
        <a href="mailto:quamodels.com@gmail.com" className="hover:text-[var(--accent)] transition-colors">
          quamodels.com@gmail.com
        </a>
      </div>
    </div>
  );
}
