import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  CouncilState,
  DiscussionEntry,
  ModelConfig,
  ChatMessage,
  ClarifyingExchange,
} from '../types';
import * as tauri from '../lib/tauri';

interface CouncilStoreState {
  state: CouncilState;
  currentModelIndex: number;
  currentStreamId: string | null;
  currentStreamContent: string;
  systemPrompts: Map<string, string>;
  clarifyingExchanges: ClarifyingExchange[];
  waitingForClarification: boolean;
  error: string | null;

  // Actions
  startDiscussion: (
    userQuestion: string,
    models: ModelConfig[],
    masterModel: { provider: string; model: string },
    systemPromptMode: 'upfront' | 'dynamic',
    getApiKey: (service: string) => Promise<string | null>,
    onEntryComplete: (entry: DiscussionEntry) => void,
  ) => Promise<void>;

  submitClarification: (answer: string) => void;
  reset: () => void;
}

export const useCouncilStore = create<CouncilStoreState>((set, get) => ({
  state: 'idle',
  currentModelIndex: -1,
  currentStreamId: null,
  currentStreamContent: '',
  systemPrompts: new Map(),
  clarifyingExchanges: [],
  waitingForClarification: false,
  error: null,

  startDiscussion: async (
    userQuestion,
    models,
    masterModel,
    systemPromptMode,
    getApiKey,
    onEntryComplete,
  ) => {
    set({ state: 'user_input', error: null });

    // Add user entry
    onEntryComplete({ role: 'user', content: userQuestion });

    const discussionSoFar: DiscussionEntry[] = [
      { role: 'user', content: userQuestion },
    ];

    // Generate system prompts if upfront mode
    if (systemPromptMode === 'upfront') {
      set({ state: 'generating_system_prompts' });
      try {
        const masterApiKey = await getApiKey(
          `com.council-of-ai-agents.${masterModel.provider}`,
        );
        if (!masterApiKey) {
          set({ state: 'error', error: `No API key found for master model provider (${masterModel.provider})` });
          return;
        }

        const promptGenMessages: ChatMessage[] = [
          {
            role: 'user',
            content: `You are the orchestrator of a council of AI models helping a user make an informed decision. The user's question is:

"${userQuestion}"

The following AI models will discuss this question in order:
${models.map((m, i) => `${i + 1}. ${m.displayName} (${m.provider})`).join('\n')}

Generate a specific, tailored system prompt for EACH council model that helps them provide their best analysis. The first model (${models[0]?.displayName}) should be instructed that it MAY ask up to 2 clarifying questions if needed. All other models should be told they CANNOT ask questions.

Each model should be encouraged to provide unique perspectives and not just repeat previous opinions.

Return your response in this exact JSON format:
${JSON.stringify(
  models.reduce(
    (acc, m) => ({
      ...acc,
      [`${m.provider}:${m.model}`]: 'system prompt here',
    }),
    {},
  ),
  null,
  2,
)}`,
          },
        ];

        const streamId = uuidv4();
        const unlisten = await tauri.onStreamToken(streamId, (token) => {
          if (!token.done) {
            set((s) => ({
              currentStreamContent: s.currentStreamContent + token.token,
            }));
          }
        });

        set({ currentStreamId: streamId, currentStreamContent: '' });

        const response = await tauri.streamChat(
          masterModel.provider as any,
          masterModel.model,
          promptGenMessages,
          'You are an AI orchestrator. Generate system prompts for council models. Return valid JSON only.',
          masterApiKey,
          streamId,
        );

        unlisten();
        set({ currentStreamId: null, currentStreamContent: '' });

        // Parse the JSON response
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const prompts = JSON.parse(jsonMatch[0]);
            const promptMap = new Map<string, string>();
            for (const [key, value] of Object.entries(prompts)) {
              promptMap.set(key, value as string);
            }
            set({ systemPrompts: promptMap });
          }
        } catch {
          // If JSON parsing fails, continue without custom prompts
          console.warn('Failed to parse system prompts, using defaults');
        }
      } catch (err) {
        set({
          state: 'error',
          error: `Failed to generate system prompts: ${err}`,
        });
        return;
      }
    }

    // Process each model sequentially
    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      set({ state: 'model_turn', currentModelIndex: i });

      try {
        const apiKey = await getApiKey(
          `com.council-of-ai-agents.${model.provider}`,
        );
        if (!apiKey) {
          set({
            state: 'error',
            error: `No API key found for ${model.displayName} (${model.provider})`,
          });
          return;
        }

        // Build messages context
        const messages: ChatMessage[] = buildContextMessages(
          userQuestion,
          discussionSoFar,
          i === 0,
        );

        // Get system prompt
        const systemPromptKey = `${model.provider}:${model.model}`;
        let systemPrompt =
          get().systemPrompts.get(systemPromptKey) || getDefaultSystemPrompt(model, i === 0);

        // Dynamic mode: generate prompt for this model
        if (systemPromptMode === 'dynamic' && i > 0) {
          try {
            const masterApiKey = await getApiKey(
              `com.council-of-ai-agents.${masterModel.provider}`,
            );
            if (masterApiKey) {
              const dynamicStreamId = uuidv4();
              const dynamicUnlisten = await tauri.onStreamToken(
                dynamicStreamId,
                () => {},
              );
              const dynamicPrompt = await tauri.streamChat(
                masterModel.provider as any,
                masterModel.model,
                [
                  {
                    role: 'user',
                    content: `Generate a system prompt for ${model.displayName} to analyze: "${userQuestion}". Previous discussion: ${JSON.stringify(discussionSoFar)}. The model should provide a unique perspective. Return only the system prompt text, no JSON.`,
                  },
                ],
                'Generate a concise system prompt. Return only the prompt text.',
                masterApiKey,
                dynamicStreamId,
              );
              dynamicUnlisten();
              systemPrompt = dynamicPrompt;
            }
          } catch {
            // Fall back to default prompt
          }
        }

        // Stream the model's response
        const streamId = uuidv4();
        set({ currentStreamId: streamId, currentStreamContent: '' });

        const unlisten = await tauri.onStreamToken(streamId, (token) => {
          if (!token.done && !token.error) {
            set((s) => ({
              currentStreamContent: s.currentStreamContent + token.token,
            }));
          }
        });

        const response = await tauri.streamChat(
          model.provider,
          model.model,
          messages,
          systemPrompt,
          apiKey,
          streamId,
        );

        unlisten();
        set({ currentStreamId: null, currentStreamContent: '' });

        // Check if first model asked a clarifying question
        if (i === 0 && looksLikeClarifyingQuestion(response)) {
          set({
            state: 'clarifying_qa',
            waitingForClarification: true,
            clarifyingExchanges: [{ question: response, answer: '' }],
          });

          // Wait for user's clarification answer
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              const current = get();
              if (!current.waitingForClarification) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 200);
          });

          const exchanges = get().clarifyingExchanges;
          const clarifyAnswer = exchanges[exchanges.length - 1]?.answer;

          if (clarifyAnswer) {
            // Get follow-up response from the first model
            const followUpMessages: ChatMessage[] = [
              ...messages,
              { role: 'assistant', content: response },
              { role: 'user', content: clarifyAnswer },
            ];

            const followUpStreamId = uuidv4();
            set({
              state: 'model_turn',
              currentStreamId: followUpStreamId,
              currentStreamContent: '',
            });

            const followUpUnlisten = await tauri.onStreamToken(
              followUpStreamId,
              (token) => {
                if (!token.done && !token.error) {
                  set((s) => ({
                    currentStreamContent: s.currentStreamContent + token.token,
                  }));
                }
              },
            );

            const followUpResponse = await tauri.streamChat(
              model.provider,
              model.model,
              followUpMessages,
              systemPrompt,
              apiKey,
              followUpStreamId,
            );

            followUpUnlisten();
            set({ currentStreamId: null, currentStreamContent: '' });

            const entry: DiscussionEntry = {
              role: 'model',
              provider: model.provider,
              model: model.model,
              displayName: model.displayName,
              systemPrompt,
              content: followUpResponse,
              clarifyingExchange: exchanges.map((e) => ({
                question: e.question,
                answer: e.answer,
              })),
            };
            discussionSoFar.push(entry);
            onEntryComplete(entry);
          }
        } else {
          const entry: DiscussionEntry = {
            role: 'model',
            provider: model.provider,
            model: model.model,
            displayName: model.displayName,
            systemPrompt,
            content: response,
          };
          discussionSoFar.push(entry);
          onEntryComplete(entry);
        }
      } catch (err) {
        // Add error entry and continue to next model
        const entry: DiscussionEntry = {
          role: 'model',
          provider: model.provider,
          model: model.model,
          displayName: model.displayName,
          content: `[Error: Failed to get response - ${err}]`,
        };
        discussionSoFar.push(entry);
        onEntryComplete(entry);
      }
    }

    // Master verdict
    set({ state: 'master_verdict', currentModelIndex: -1 });

    try {
      const masterApiKey = await getApiKey(
        `com.council-of-ai-agents.${masterModel.provider}`,
      );
      if (!masterApiKey) {
        set({
          state: 'error',
          error: `No API key found for master model (${masterModel.provider})`,
        });
        return;
      }

      const verdictMessages: ChatMessage[] = [
        {
          role: 'user',
          content: buildMasterVerdictPrompt(userQuestion, discussionSoFar),
        },
      ];

      const streamId = uuidv4();
      set({ currentStreamId: streamId, currentStreamContent: '' });

      const unlisten = await tauri.onStreamToken(streamId, (token) => {
        if (!token.done && !token.error) {
          set((s) => ({
            currentStreamContent: s.currentStreamContent + token.token,
          }));
        }
      });

      const verdictResponse = await tauri.streamChat(
        masterModel.provider as any,
        masterModel.model,
        verdictMessages,
        `You are the master AI judge in a council of AI models. You have reviewed all council members' opinions on the user's question. Your job is to synthesize the best advice, resolve any disagreements, and deliver a clear, actionable final verdict. Be thorough but concise. Structure your response with clear sections.`,
        masterApiKey,
        streamId,
      );

      unlisten();
      set({ currentStreamId: null, currentStreamContent: '' });

      const verdictEntry: DiscussionEntry = {
        role: 'master_verdict',
        provider: masterModel.provider,
        model: masterModel.model,
        content: verdictResponse,
      };
      onEntryComplete(verdictEntry);

      set({ state: 'complete' });
    } catch (err) {
      set({ state: 'error', error: `Master verdict failed: ${err}` });
    }
  },

  submitClarification: (answer) => {
    set((s) => {
      const exchanges = [...s.clarifyingExchanges];
      if (exchanges.length > 0) {
        exchanges[exchanges.length - 1].answer = answer;
      }
      return {
        clarifyingExchanges: exchanges,
        waitingForClarification: false,
      };
    });
  },

  reset: () => {
    set({
      state: 'idle',
      currentModelIndex: -1,
      currentStreamId: null,
      currentStreamContent: '',
      systemPrompts: new Map(),
      clarifyingExchanges: [],
      waitingForClarification: false,
      error: null,
    });
  },
}));

function buildContextMessages(
  userQuestion: string,
  discussionSoFar: DiscussionEntry[],
  isFirstModel: boolean,
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: 'user', content: userQuestion },
  ];

  if (!isFirstModel) {
    const previousOpinions = discussionSoFar
      .filter((e): e is Extract<DiscussionEntry, { role: 'model' }> => e.role === 'model')
      .map(
        (e) =>
          `--- ${e.displayName} (${e.provider}) ---\n${e.content}`,
      )
      .join('\n\n');

    if (previousOpinions) {
      messages.push({
        role: 'user',
        content: `Here are the previous council members' opinions:\n\n${previousOpinions}\n\nPlease provide your own analysis and verdict. You may agree or disagree with previous opinions, but provide your own reasoning.`,
      });
    }
  }

  return messages;
}

function getDefaultSystemPrompt(model: ModelConfig, isFirst: boolean): string {
  if (isFirst) {
    return `You are ${model.displayName}, a member of an AI council helping a user make an informed decision. You are the FIRST model to respond. You may ask up to 2 brief clarifying questions if the user's question is ambiguous or missing important details. If the question is clear enough, proceed directly with your analysis and recommendation. Be thorough, factual, and specific.`;
  }
  return `You are ${model.displayName}, a member of an AI council helping a user make an informed decision. You will see the user's question and previous council members' responses. Provide your own unique perspective and analysis. Do NOT ask any questions to the user. Be thorough, factual, and specific. If you agree with previous members, explain why. If you disagree, explain your reasoning.`;
}

function looksLikeClarifyingQuestion(response: string): boolean {
  const questionIndicators = [
    'before I provide my recommendation',
    'could you clarify',
    'I have a few questions',
    'let me ask',
    'to help narrow down',
    'could you tell me',
    'what is your preference',
    'do you have a preference',
  ];
  const lowerResponse = response.toLowerCase();
  return questionIndicators.some((indicator) =>
    lowerResponse.includes(indicator),
  ) && response.includes('?');
}

function buildMasterVerdictPrompt(
  userQuestion: string,
  discussion: DiscussionEntry[],
): string {
  const opinions = discussion
    .filter((e) => e.role === 'model')
    .map((e) => {
      const m = e as Extract<DiscussionEntry, { role: 'model' }>;
      return `--- ${m.displayName} ---\n${m.content}`;
    })
    .join('\n\n');

  return `The user asked: "${userQuestion}"

The following AI council members have provided their analysis:

${opinions}

As the master judge, please synthesize all opinions and deliver your FINAL VERDICT. Consider:
1. Points of agreement across models
2. Points of disagreement and which position is stronger
3. Any factual errors in the responses
4. A clear, actionable recommendation

Provide your final verdict with clear reasoning.`;
}
