import { v4 as uuidv4 } from 'uuid';
import { getApiKey, streamChat, onStreamToken } from './tauri';
import type { AppSettings, Provider } from '../types';

export async function generateSessionTitle(
  question: string,
  settings: AppSettings,
): Promise<string | null> {
  try {
    const masterApiKey = await getApiKey(
      `com.council-of-ai-agents.${settings.masterModel.provider}`,
    );
    if (!masterApiKey) return null;

    const streamId = uuidv4();
    const unlisten = await onStreamToken(streamId, () => {});
    const result = await streamChat(
      settings.masterModel.provider as Provider,
      settings.masterModel.model,
      [
        {
          role: 'user',
          content: `Generate a short, descriptive title (5-8 words max, no quotes, no punctuation at the end) for this conversation:\n\n"${question}"`,
        },
      ],
      'You generate concise conversation titles. Return ONLY the title text, nothing else.',
      masterApiKey,
      streamId,
    );
    unlisten();

    const cleanTitle = result.content.trim().replace(/^["']|["']$/g, '');
    return cleanTitle || null;
  } catch {
    return null;
  }
}
