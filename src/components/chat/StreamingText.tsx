import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSettingsStore } from '../../stores/settingsStore';

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
}

export default function StreamingText({ content, isStreaming = false }: StreamingTextProps) {
  const cursorStyle = useSettingsStore((s) => s.settings.cursorStyle);

  return (
    <div className="markdown-content text-[15px] leading-relaxed text-[var(--color-text-primary)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      {isStreaming && (
        <span
          className={`cursor-${cursorStyle} inline-block w-[3px] h-[1.1em] ml-1 rounded-sm bg-[var(--color-accent)] align-text-bottom`}
        />
      )}
    </div>
  );
}
