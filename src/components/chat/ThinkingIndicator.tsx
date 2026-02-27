import { motion } from 'framer-motion';

interface ThinkingIndicatorProps {
  modelName?: string;
  color?: string;
}

export default function ThinkingIndicator({ modelName, color = 'var(--color-accent)' }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      {modelName && (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {modelName} is thinking
        </span>
      )}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.85, 1.1, 0.85],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
