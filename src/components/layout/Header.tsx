import { Settings, Bot } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getProviderColor } from '../../types';
import type { Provider } from '../../types';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const activeSession = useSessionStore((s) => s.activeSession);
  const appMode = useSettingsStore((s) => s.appMode);
  const title = activeSession?.title || 'New Session';
  const agent = appMode === 'direct_chat' ? activeSession?.directChatAgent : null;

  const handleDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.titlebar-no-drag')) return;
    getCurrentWindow().startDragging();
  };

  return (
    <div
      onMouseDown={handleDrag}
      className="titlebar-drag-region h-12 flex items-center justify-between px-4 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)]"
    >
      <div className="flex items-center gap-2 truncate pl-16">
        <span className="text-sm font-bold text-[var(--color-text-primary)] truncate">
          {title}
        </span>
        {agent && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: getProviderColor(agent.provider as Provider) + '20',
              color: getProviderColor(agent.provider as Provider),
            }}
          >
            <Bot size={10} />
            {agent.displayName}
          </span>
        )}
      </div>
      <button
        onClick={onOpenSettings}
        className="titlebar-no-drag p-2 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
        title="Settings"
      >
        <Settings size={18} />
      </button>
    </div>
  );
}
