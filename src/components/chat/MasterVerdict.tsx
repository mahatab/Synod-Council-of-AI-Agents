import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import StreamingText from './StreamingText';
import ThinkingIndicator from './ThinkingIndicator';

interface MasterVerdictProps {
  content: string;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export default function MasterVerdict({
  content,
  isStreaming = false,
  isThinking = false,
}: MasterVerdictProps) {
  return (
    <motion.div
      className="px-6 py-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="rounded-[var(--radius-lg)] border-2 border-[var(--color-accent)] bg-[var(--color-bg-verdict)] p-5">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
            <Scale size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-[var(--color-accent)] uppercase tracking-wide">
                Final Verdict
              </span>
            </div>

            {isThinking && !content ? (
              <ThinkingIndicator modelName="Master Judge" color="var(--color-accent)" />
            ) : (
              <StreamingText content={content} isStreaming={isStreaming} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
