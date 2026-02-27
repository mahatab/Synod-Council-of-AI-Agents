import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import type { ProviderInfo } from '../../types';

interface ApiKeyInfoPopoverProps {
  provider: ProviderInfo;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiKeyInfoPopover({
  provider,
  isOpen,
  onClose,
}: ApiKeyInfoPopoverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute right-0 top-full mt-2 z-10 w-80 bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rounded-[var(--radius-lg)] shadow-xl p-4"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Get {provider.name} API Key
            </h4>
            <button
              onClick={onClose}
              className="p-1 rounded text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              <X size={14} />
            </button>
          </div>

          <ol className="space-y-2 mb-3">
            {provider.apiKeySteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-[var(--color-text-secondary)]">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[10px] font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <a
            href={provider.apiKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline"
          >
            Open {provider.name} Console
            <ExternalLink size={12} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
