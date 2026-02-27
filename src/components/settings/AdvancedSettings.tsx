import { useSettingsStore } from '../../stores/settingsStore';
import type { SystemPromptMode } from '../../types';

export default function AdvancedSettings() {
  const { settings, updateSettings } = useSettingsStore();

  const modes: { id: SystemPromptMode; label: string; description: string }[] = [
    {
      id: 'upfront',
      label: 'Generate All Upfront',
      description:
        'Master model generates system prompts for all council models before the discussion starts. One API call, faster overall.',
    },
    {
      id: 'dynamic',
      label: 'Generate Dynamically Per Turn',
      description:
        'Master model generates each system prompt right before that model responds, incorporating context from previous responses. More adaptive but uses more API calls.',
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
        System Prompt Generation
      </h3>
      <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
        How the master model creates system prompts for council members
      </p>

      <div className="space-y-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => updateSettings({ systemPromptMode: mode.id })}
            className={`w-full text-left p-3 rounded-[var(--radius-md)] border transition-all ${
              settings.systemPromptMode === mode.id
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]'
                : 'border-[var(--color-border-primary)] hover:border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)]'
            }`}
          >
            <span
              className={`text-sm font-medium ${
                settings.systemPromptMode === mode.id
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-primary)]'
              }`}
            >
              {mode.label}
            </span>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              {mode.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
