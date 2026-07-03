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
  inference_mode: string;
  status: string;
  memory_usage_gb: number;
  total_memory_gb: number;
  local_model_exists: boolean;
  local_model_path: string;
  device: string;
}

export interface ModelMetrics {
  total_requests: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  average_latency_seconds: number;
  total_generation_time_seconds: number;
  active_mode: string;
  system_ram_gb: number;
  device: string;
}

export interface AppSettings {
  inferenceMode: 'auto' | 'local' | 'huggingface';
  temperature: number;
  maxTokens: number;
  topP: number;
  contextLength: number;
  streaming: boolean;
  theme: 'dark' | 'light';
  hfToken: string;
  hfModelId: string;
}
