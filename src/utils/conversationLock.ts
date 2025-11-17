import { startConversation } from '../services/conversationService';

export interface ConversationParams {
  sessionId: string;
  blueprintId: string;
  lang: string;
  city: string;
}

/**
 * Ensures a conversation exists for the given parameters, creating it only once
 * Uses sessionStorage and in-memory cache to prevent duplicate API calls
 */
export async function ensureConversation(params: ConversationParams): Promise<string> {
  const { sessionId, blueprintId, lang, city } = params;
  
  const lockKey = `conv:start:${sessionId}:${blueprintId}`;
  const idKey = `${lockKey}:id`;

  // Initialize global promise cache if it doesn't exist
  (window as any).__convPromises ??= {};

  // 1) If already in progress, reuse the same promise
  if ((window as any).__convPromises[lockKey]) {

    const existing = await (window as any).__convPromises[lockKey];
    return existing;
  }

  // 2) If already created in this session, reuse the ID
  const existingId = sessionStorage.getItem(idKey);
  if (existingId) {

    return existingId;
  }

  // 3) Otherwise create (and memorize)

  (window as any).__convPromises[lockKey] = (async () => {
    try {
      const resp = await startConversation(sessionId, blueprintId, lang, city);
      const id = resp.conversation?.conversation_id ?? resp.conversation_id;
      
      if (!id) {
        throw new Error('No conversation ID returned from API');
      }
      

      sessionStorage.setItem(idKey, id);
      return id;
    } catch (error) {

      throw error;
    }
  })();

  try {
    return await (window as any).__convPromises[lockKey];
  } finally {
    // Clean up the promise from cache
    delete (window as any).__convPromises[lockKey];
  }
}

/**
 * Clears conversation locks for a specific session/blueprint combination
 */
export function clearConversationLock(sessionId: string, blueprintId: string): void {
  const lockKey = `conv:start:${sessionId}:${blueprintId}`;
  const idKey = `${lockKey}:id`;
  
  sessionStorage.removeItem(idKey);
  delete (window as any).__convPromises?.[lockKey];
  

}

/**
 * Clears all conversation locks (useful for debugging or logout)
 */
export function clearAllConversationLocks(): void {
  // Clear sessionStorage keys that match our pattern
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('conv:start:')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
  
  // Clear in-memory promises
  (window as any).__convPromises = {};
  

}