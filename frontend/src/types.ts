export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  activeModel: string;
  timestamp: number;
}

export interface ModelInfo {
  model_name: string;
  status: string;
}

export interface AppSettings {
  temperature: number;
  maxTokens: number;
  topP: number;
  streaming: boolean;
  theme: 'dark' | 'light';
}
