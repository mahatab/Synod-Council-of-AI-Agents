import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import StreamingText from './StreamingText';
import ThinkingIndicator from './ThinkingIndicator';
import { getProviderColor } from '../../types';
import type { Provider } from '../../types';

interface ModelResponseProps {
  provider: string;
  model: string;
  displayName: string;
  content: string;
  isStreaming?: boolean;
  isThinking?: boolean;
  clarifyingExchange?: { question: string; answer: string }[];
}

export default function ModelResponse({
  provider,
  displayName,
  content,
  isStreaming = false,
  isThinking = false,
  clarifyingExchange,
}: ModelResponseProps) {
  const color = getProviderColor(provider as Provider);

  return (
    <motion.div
      className="px-6 py-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex gap-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Bot size={16} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {displayName}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${color}15`,
                color,
              }}
            >
              {provider}
            </span>
          </div>

          {isThinking && !content ? (
            <ThinkingIndicator modelName={displayName} color={color} />
          ) : (
            <>
              {clarifyingExchange && clarifyingExchange.length > 0 && (
                <div className="mb-3 space-y-2">
                  {clarifyingExchange.map((exchange, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]"
                    >
                      <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                        <span className="font-medium">Q:</span> {exchange.question}
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        <span className="font-medium">A:</span> {exchange.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <StreamingText content={content} isStreaming={isStreaming} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
