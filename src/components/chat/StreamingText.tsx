import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
}

export default function StreamingText({ content, isStreaming = false }: StreamingTextProps) {
  return (
    <div className="markdown-content text-[15px] leading-relaxed text-[var(--color-text-primary)]">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      {isStreaming && (
        <motion.span
          className="inline-block w-0.5 h-5 ml-0.5 bg-[var(--color-accent)] align-text-bottom"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  );
}
