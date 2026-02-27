import { User } from 'lucide-react';

interface UserMessageProps {
  content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex gap-4 px-6 py-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
        <User size={16} className="text-[var(--color-text-secondary)]" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)]">
          {content}
        </p>
      </div>
    </div>
  );
}
