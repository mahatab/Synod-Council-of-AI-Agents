import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <div className="titlebar-drag-region h-12 flex items-center justify-end px-4 bg-[var(--color-bg-primary)] border-b border-[var(--color-border-primary)]">
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
