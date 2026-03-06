import { Users, MessageCircle } from 'lucide-react';
import type { AppMode } from '../../types';

interface ModeToggleProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex w-full bg-[var(--color-bg-tertiary)] rounded-[var(--radius-md)] p-0.5">
      <button
        onClick={() => onChange('council')}
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
          mode === 'council'
            ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
            : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        <Users size={12} />
        Council
      </button>
      <button
        onClick={() => onChange('direct_chat')}
        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-all ${
          mode === 'direct_chat'
            ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm'
            : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]'
        }`}
      >
        <MessageCircle size={12} />
        Direct
      </button>
    </div>
  );
}
