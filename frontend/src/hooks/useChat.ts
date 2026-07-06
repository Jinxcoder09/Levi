import { useState, useEffect } from 'react';
import type { ChatMessage, Conversation, AppSettings } from '../types';

const LOCAL_STORAGE_CONVS_KEY = 'levi_conversations';
const LOCAL_STORAGE_SETTINGS_KEY = 'levi_settings';

const DEFAULT_SETTINGS: AppSettings = {
  temperature: 0.7,
  maxTokens: 512,
  topP: 0.9,
  streaming: true,
  theme: 'dark',
};

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const modelInfo = { model_name: 'SmolLM2-360M-Instruct-Q4_K_M', status: 'loaded' };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Settings
  useEffect(() => {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  // Initialize Conversations
  useEffect(() => {
    const savedConvs = localStorage.getItem(LOCAL_STORAGE_CONVS_KEY);
    if (savedConvs) {
      try {
        const parsed = JSON.parse(savedConvs);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        }
      } catch (e) {
        setConversations([]);
      }
    }
  }, []);

  // Save Conversations on change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_CONVS_KEY, JSON.stringify(conversations));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONVS_KEY);
    }
  }, [conversations]);

  // Apply CSS Class for Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // no-op: model info is static for 512MB-optimized local mode

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  };

  const createNewConversation = (title: any = 'New Chat') => {
    const cleanTitle = typeof title === 'string' && title.trim() ? title : 'New Chat';
    const newConv: Conversation = {
      id: Math.random().toString(36).substring(7),
      title: cleanTitle,
      messages: [],
      activeModel: 'SmolLM2-360M-Instruct-Q4_K_M',
      timestamp: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    return newConv;
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId(null);
      }
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    let currentConv = activeConversation;
    if (!currentConv) {
      currentConv = createNewConversation(content.substring(0, 30));
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add user message to conversation list
    const updatedMessages = [...currentConv.messages, userMsg];
    
    // Set a quick temporary assistant message for streaming
    const assistantMsgId = Math.random().toString(36).substring(7);
    const tempAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConv!.id
          ? { ...c, messages: [...updatedMessages, tempAssistantMsg], timestamp: Date.now() }
          : c
      )
    );

    setIsLoading(true);
    setError(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          top_p: settings.topP,
          stream: settings.streaming,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      if (settings.streaming && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('data: ')) {
              try {
                const chunkData = JSON.parse(cleanLine.slice(6));
                
                if (chunkData.content) {
                  assistantContent += chunkData.content;
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === currentConv!.id
                        ? {
                            ...c,
                            messages: c.messages.map((m) =>
                              m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                            ),
                          }
                        : c
                    )
                  );
                }
                
                if (chunkData.done && chunkData.usage) {}
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
        }
      } else {
        const result = await response.json();
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConv!.id
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: result.content } : m
                  ),
                }
              : c
          )
        );
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Something went wrong');
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConv!.id
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: `Error: Could not retrieve response from server. Detail: ${e.message}` }
                    : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const executeCodeAction = async (action: string, code: string, language: string, context?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const prompt = `${action} the following ${language} code:\n\n${code}${context ? '\n\nContext: ' + context : ''}`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
          stream: false,
        }),
      });
      if (!response.ok) throw new Error(`API failed: ${response.statusText}`);
      const result = await response.json();
      return result.content;
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Execution failed');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletion = async (prefix: string, suffix: string, language: string): Promise<string> => {
    try {
      const response = await fetch('/api/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prefix,
          suffix,
          language,
          max_tokens: 64,
          temperature: 0.1,
          stream: false,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.content;
      }
      return '';
    } catch (e) {
      console.error('Completion request failed', e);
      return '';
    }
  };

  const clearHistory = () => {
    setConversations([]);
    setActiveConversationId(null);
  };

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    activeConversation,
    settings,
    modelInfo,
    isLoading,
    error,
    updateSettings,
    createNewConversation,
    deleteConversation,
    sendMessage,
    executeCodeAction,
    getCompletion,
    clearHistory,
  };
};
