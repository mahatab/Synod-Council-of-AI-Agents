import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleQuestion, Send } from 'lucide-react';
import Button from '../common/Button';

interface ClarifyingQuestionProps {
  question: string;
  onAnswer: (answer: string) => void;
}

export default function ClarifyingQuestion({ question, onAnswer }: ClarifyingQuestionProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    if (answer.trim()) {
      onAnswer(answer.trim());
      setAnswer('');
    }
  };

  return (
    <motion.div
      className="px-6 py-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-focus)] bg-[var(--color-accent-light)] p-4">
        <div className="flex items-start gap-3 mb-3">
          <MessageCircleQuestion
            size={18}
            className="text-[var(--color-accent)] mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-[var(--color-text-primary)]">{question}</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type your answer..."
            className="flex-1 px-3 py-2 text-sm bg-[var(--color-bg-input)] border border-[var(--color-border-primary)] rounded-[var(--radius-md)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
            autoFocus
          />
          <Button onClick={handleSubmit} size="sm" disabled={!answer.trim()}>
            <Send size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
