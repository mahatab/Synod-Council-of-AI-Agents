export type Provider = 'anthropic' | 'openai' | 'google' | 'xai';

export interface ModelConfig {
  provider: Provider;
  model: string;
  displayName: string;
  order: number;
}

export interface MasterModelConfig {
  provider: Provider;
  model: string;
}

export type SystemPromptMode = 'upfront' | 'dynamic';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  councilModels: ModelConfig[];
  masterModel: MasterModelConfig;
  systemPromptMode: SystemPromptMode;
  theme: ThemeMode;
  sessionSavePath: string | null;
  setupCompleted: boolean;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ClarifyingExchange {
  question: string;
  answer: string;
}

export interface DiscussionEntryUser {
  role: 'user';
  content: string;
}

export interface DiscussionEntryModel {
  role: 'model';
  provider: string;
  model: string;
  displayName: string;
  systemPrompt?: string;
  content: string;
  clarifyingExchange?: ClarifyingExchange[];
}

export interface DiscussionEntryMasterVerdict {
  role: 'master_verdict';
  provider: string;
  model: string;
  content: string;
}

export type DiscussionEntry =
  | DiscussionEntryUser
  | DiscussionEntryModel
  | DiscussionEntryMasterVerdict;

export interface CouncilConfig {
  models: ModelConfig[];
  masterModel: MasterModelConfig;
  systemPromptMode: SystemPromptMode;
}

export interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userQuestion: string;
  councilConfig: CouncilConfig;
  discussion: DiscussionEntry[];
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface StreamToken {
  streamId: string;
  token: string;
  done: boolean;
  error?: string;
}

export type CouncilState =
  | 'idle'
  | 'user_input'
  | 'generating_system_prompts'
  | 'model_turn'
  | 'clarifying_qa'
  | 'master_verdict'
  | 'complete'
  | 'error';

export interface ProviderInfo {
  id: Provider;
  name: string;
  keychainService: string;
  models: { id: string; name: string }[];
  apiKeyUrl: string;
  apiKeySteps: string[];
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    keychainService: 'com.council-of-ai-agents.anthropic',
    models: [
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5' },
    ],
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    apiKeySteps: [
      'Go to console.anthropic.com',
      'Sign in or create an account',
      'Navigate to Settings > API Keys',
      'Click "Create Key" and give it a name',
      'Copy the key (it starts with "sk-ant-")',
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    keychainService: 'com.council-of-ai-agents.openai',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
    ],
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeySteps: [
      'Go to platform.openai.com',
      'Sign in or create an account',
      'Navigate to API Keys in the sidebar',
      'Click "Create new secret key"',
      'Copy the key (it starts with "sk-")',
    ],
  },
  {
    id: 'google',
    name: 'Google',
    keychainService: 'com.council-of-ai-agents.google',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    ],
    apiKeyUrl: 'https://aistudio.google.com/apikey',
    apiKeySteps: [
      'Go to aistudio.google.com',
      'Sign in with your Google account',
      'Click "Get API Key" in the top bar',
      'Click "Create API Key"',
      'Select or create a Google Cloud project',
      'Copy the generated API key',
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    keychainService: 'com.council-of-ai-agents.xai',
    models: [
      { id: 'grok-3', name: 'Grok-3' },
      { id: 'grok-3-mini', name: 'Grok-3 Mini' },
    ],
    apiKeyUrl: 'https://console.x.ai',
    apiKeySteps: [
      'Go to console.x.ai',
      'Sign in with your X (Twitter) account',
      'Navigate to API Keys section',
      'Click "Create API Key"',
      'Copy the generated key',
    ],
  },
];

export function getProviderInfo(providerId: Provider): ProviderInfo {
  return PROVIDERS.find((p) => p.id === providerId)!;
}

export function getProviderColor(provider: Provider): string {
  switch (provider) {
    case 'anthropic':
      return '#D97757';
    case 'openai':
      return '#10A37F';
    case 'google':
      return '#4285F4';
    case 'xai':
      return '#1DA1F2';
  }
}
