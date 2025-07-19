import { Message, ChatHistory } from '../types';

const HISTORY_KEY = 'dialogix_chat_history';
const MAX_MESSAGES = 20;

export const saveHistory = (history: ChatHistory): void => {
  try {
    // Convert Date objects to strings for storage
    const serializedHistory = {
      ...history,
      messages: history.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(serializedHistory));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const loadHistory = (): ChatHistory | null => {
  try {
    const historyString = localStorage.getItem(HISTORY_KEY);
    if (!historyString) return null;
    
    const parsedHistory = JSON.parse(historyString);
    
    // Convert timestamp strings back to Date objects
    return {
      ...parsedHistory,
      messages: parsedHistory.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    };
  } catch (error) {
    console.error('Error loading chat history:', error);
    return null;
  }
};

export const addMessageToHistory = (
  messages: Message[],
  newMessage: Message
): Message[] => {
  // Add new message and limit to MAX_MESSAGES
  const updatedMessages = [...messages, newMessage];
  
  // If we exceed the maximum, remove oldest messages
  if (updatedMessages.length > MAX_MESSAGES) {
    return updatedMessages.slice(updatedMessages.length - MAX_MESSAGES);
  }
  
  return updatedMessages;
};

export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};