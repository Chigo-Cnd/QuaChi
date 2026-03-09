import { Sun, Moon, Monitor } from 'lucide-react';
import { useUIStore } from '@/store';
import type { Theme } from '@/types';

const THEMES: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun,     label: 'Light' },
  { value: 'dark',  icon: Moon,    label: 'Dark'  },
  { value: 'grey',  icon: Monitor, label: 'Grey'  },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border"
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}>
      {THEMES.map(t => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className="p-1.5 rounded-md transition-all"
          title={t.label}
          style={{
            background: theme === t.value ? 'var(--accent)' : 'transparent',
            color:      theme === t.value ? 'white' : 'var(--text-muted)',
          }}
        >
          <t.icon size={14} />
        </button>
      ))}
    </div>
  );
}
