import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserMessage from './UserMessage';
import ModelResponse from './ModelResponse';
import MasterVerdict from './MasterVerdict';
import ClarifyingQuestion from './ClarifyingQuestion';
import ThinkingIndicator from './ThinkingIndicator';
import Button from '../common/Button';
import { useCouncilStore } from '../../stores/councilStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSessionStore } from '../../stores/sessionStore';
import { getApiKey } from '../../lib/tauri';
import type { DiscussionEntry, Session } from '../../types';

export default function ChatView() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [entries, setEntries] = useState<DiscussionEntry[]>([]);

  const council = useCouncilStore();
  const settings = useSettingsStore((s) => s.settings);
  const { activeSession, createSession, saveCurrentSession, updateActiveSession } =
    useSessionStore();

  // Load entries from active session
  useEffect(() => {
    if (activeSession) {
      setEntries(activeSession.discussion);
    } else {
      setEntries([]);
    }
  }, [activeSession?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, council.currentStreamContent, council.state]);

  const handleEntryComplete = useCallback(
    (entry: DiscussionEntry) => {
      setEntries((prev) => [...prev, entry]);
      updateActiveSession({
        discussion: [...(activeSession?.discussion || []), entry],
      });
    },
    [activeSession, updateActiveSession],
  );

  const handleSubmit = async () => {
    const question = input.trim();
    if (!question || council.state !== 'idle') return;

    setInput('');
    setEntries([]);

    // Create a new session
    const session: Session = {
      id: uuidv4(),
      title: question.length > 57 ? question.slice(0, 57) + '...' : question,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userQuestion: question,
      councilConfig: {
        models: settings.councilModels,
        masterModel: settings.masterModel,
        systemPromptMode: settings.systemPromptMode,
      },
      discussion: [],
    };

    createSession(session);

    await council.startDiscussion(
      question,
      settings.councilModels,
      settings.masterModel,
      settings.systemPromptMode,
      getApiKey,
      handleEntryComplete,
    );

    // Save session when done
    saveCurrentSession(settings.sessionSavePath);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isProcessing = council.state !== 'idle' && council.state !== 'complete' && council.state !== 'error';
  const hasModels = settings.councilModels.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {entries.length === 0 && council.state === 'idle' ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center mx-auto mb-6">
                <Sparkles size={28} className="text-[var(--color-accent)]" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-3">
                Council of AI Agents
              </h1>
              <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed mb-6">
                Ask a question and get insights from multiple AI models working
                together. Each model provides its unique perspective before a
                master model delivers the final verdict.
              </p>
              {!hasModels && (
                <p className="text-sm text-[var(--color-accent)]">
                  Set up your council models in Settings to get started.
                </p>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-6">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, i) => {
                if (entry.role === 'user') {
                  return <UserMessage key={`user-${i}`} content={entry.content} />;
                }
                if (entry.role === 'model') {
                  return (
                    <ModelResponse
                      key={`model-${i}`}
                      provider={entry.provider}
                      model={entry.model}
                      displayName={entry.displayName}
                      content={entry.content}
                      clarifyingExchange={entry.clarifyingExchange}
                    />
                  );
                }
                if (entry.role === 'master_verdict') {
                  return (
                    <MasterVerdict key={`verdict-${i}`} content={entry.content} />
                  );
                }
                return null;
              })}
            </AnimatePresence>

            {/* Active streaming content */}
            {council.state === 'generating_system_prompts' && (
              <div className="px-6 py-4">
                <ThinkingIndicator modelName="Generating system prompts" />
              </div>
            )}

            {council.state === 'model_turn' && council.currentModelIndex >= 0 && (
              <ModelResponse
                provider={settings.councilModels[council.currentModelIndex]?.provider || ''}
                model={settings.councilModels[council.currentModelIndex]?.model || ''}
                displayName={
                  settings.councilModels[council.currentModelIndex]?.displayName || ''
                }
                content={council.currentStreamContent}
                isStreaming={true}
                isThinking={!council.currentStreamContent}
              />
            )}

            {council.state === 'clarifying_qa' && council.waitingForClarification && (
              <ClarifyingQuestion
                question={
                  council.clarifyingExchanges[council.clarifyingExchanges.length - 1]
                    ?.question || ''
                }
                onAnswer={council.submitClarification}
              />
            )}

            {council.state === 'master_verdict' && (
              <MasterVerdict
                content={council.currentStreamContent}
                isStreaming={true}
                isThinking={!council.currentStreamContent}
              />
            )}

            {council.state === 'error' && council.error && (
              <div className="px-6 py-4">
                <div className="p-4 rounded-[var(--radius-md)] bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {council.error}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-3 bg-[var(--color-bg-input)] border border-[var(--color-border-primary)] rounded-[var(--radius-lg)] px-4 py-3 focus-within:border-[var(--color-border-focus)] focus-within:ring-1 focus-within:ring-[var(--color-border-focus)] transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasModels
                  ? 'Ask the council for advice...'
                  : 'Configure your models in Settings first...'
              }
              rows={1}
              disabled={isProcessing || !hasModels}
              className="flex-1 bg-transparent text-[15px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] resize-none focus:outline-none disabled:opacity-50 min-h-[24px] max-h-[120px]"
              style={{ overflow: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing || !hasModels}
              size="sm"
              className="flex-shrink-0"
            >
              <Send size={16} />
            </Button>
          </div>
          {isProcessing && (
            <p className="mt-2 text-xs text-center text-[var(--color-text-tertiary)]">
              Council is deliberating...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
