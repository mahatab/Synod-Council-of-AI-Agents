import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ThemeMode } from '../../types';

const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

export default function AppearanceSettings() {
  const { settings, setTheme } = useSettingsStore();

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
        Appearance
      </h3>

      <div className="flex gap-2">
        {themes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-[var(--radius-md)] border transition-all ${
              settings.theme === id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)]'
            }`}
          >
            <Icon
              size={20}
              className={
                settings.theme === id
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-tertiary)]'
              }
            />
            <span
              className={`text-xs font-medium ${
                settings.theme === id
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
