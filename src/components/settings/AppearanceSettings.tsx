import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ThemeMode, CursorStyle } from '../../types';

const themes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

const cursorStyles: { id: CursorStyle; label: string; description: string }[] = [
  { id: 'ripple', label: 'Ripple Pulse', description: 'Expanding rings radiate outward' },
  { id: 'breathing', label: 'Breathing Glow', description: 'Circle pulses with a warm aura' },
  { id: 'orbit', label: 'Orbit Ring', description: 'Dot orbits around the cursor' },
  { id: 'multi', label: 'Multi-Caret', description: 'Three cursors blink in a wave' },
];

export default function AppearanceSettings() {
  const { settings, setTheme, updateSettings } = useSettingsStore();

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Theme
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

      {/* Cursor Animation */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
          Streaming Cursor
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
          Animation style shown while AI models are responding
        </p>
        <div className="grid grid-cols-2 gap-2">
          {cursorStyles.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => updateSettings({ cursorStyle: id })}
              className={`flex items-center gap-3 p-3 rounded-[var(--radius-md)] border text-left transition-all ${
                settings.cursorStyle === id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                  : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)]'
              }`}
            >
              {/* Live cursor preview */}
              <span
                className={`cursor-${id} flex-shrink-0 ${
                  ['breathing', 'orbit'].includes(id)
                    ? 'w-2 h-2 rounded-full'
                    : 'w-[3px] h-5 rounded-sm'
                } bg-[var(--color-accent)]`}
              />
              <div className="min-w-0">
                <span
                  className={`block text-xs font-medium ${
                    settings.cursorStyle === id
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-primary)]'
                  }`}
                >
                  {label}
                </span>
                <span className="block text-[11px] text-[var(--color-text-tertiary)] leading-tight mt-0.5">
                  {description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
