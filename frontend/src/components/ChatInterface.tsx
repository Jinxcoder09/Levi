import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, AlertCircle, Copy, Check, 
  Upload, Terminal, HelpCircle, FileText, Download,
  CornerDownLeft, Paperclip, RotateCcw,
  User, Shield, MessageSquare, Plus, Search, Code, Mic, Trash2
} from 'lucide-react';
import type { ChatMessage, Conversation, ModelInfo } from '../types';

interface ChatInterfaceProps {
  activeConversation: Conversation | null;
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  error: string | null;
  modelInfo: ModelInfo | null;
}

// Markdown & Code Renderer block
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 leading-relaxed text-sm select-text font-sans">
      {parts.map((part, idx) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          const firstLine = lines[0].replace('```', '').trim();
          const language = firstLine || 'code';
          const code = lines.slice(1, -1).join('\n');
          const blockId = `${idx}-${language}`;
          const filename = `code-snippet.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : 'txt'}`;

          const codeLines = code.split('\n');

          return (
            <div key={idx} className="my-4 border border-[#1d1b2e] rounded-xl overflow-hidden bg-[#0d1117] shadow-lg font-mono">
              {/* Header Titlebar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#1d1b2e] text-xs text-[#9d99b3] select-none">
                <span className="flex items-center gap-2 uppercase font-semibold text-foreground tracking-wide text-[11px]">
                  <Terminal size={12} className="text-primary" />
                  {language}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(code, filename)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors p-1"
                    title="Download File"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => handleCopy(code, blockId)}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors p-1"
                  >
                    {copiedId === blockId ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-500 font-bold text-[10px]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span className="text-[10px] font-bold">COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editor area with line numbers */}
              <div className="flex overflow-x-auto text-[12px] leading-6 py-3 bg-[#0d1117]">
                <div className="text-right text-[#484f58] select-none pr-3 pl-4 border-r border-[#21262d] font-mono shrink-0">
                  {codeLines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="px-4 text-foreground font-mono w-full overflow-x-auto whitespace-pre">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          );
        } else {
          const lines = part.split('\n');
          return (
            <div key={idx} className="space-y-2">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                  return (
                    <ul key={lIdx} className="list-disc pl-6 my-1 space-y-1 text-foreground/90">
                      <li>{renderInlineStyles(trimmed.substring(2))}</li>
                    </ul>
                  );
                }
                
                if (trimmed.startsWith('#')) {
                  const level = (trimmed.match(/^#+/) || [''])[0].length;
                  const headerText = trimmed.replace(/^#+\s*/, '');
                  const headerClasses = level === 1 
                    ? 'text-lg font-bold my-3 text-foreground tracking-tight border-b border-[#1d1b2e] pb-1.5' 
                    : level === 2 
                      ? 'text-base font-bold my-2 text-foreground tracking-tight'
                      : 'text-sm font-semibold my-2 text-foreground';
                  return <div key={lIdx} className={headerClasses}>{renderInlineStyles(headerText)}</div>;
                }

                return line ? <p key={lIdx} className="my-1.5 text-foreground/90 leading-relaxed">{renderInlineStyles(line)}</p> : <div key={lIdx} className="h-2" />;
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

const renderInlineStyles = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="px-1.5 py-0.5 rounded bg-secondary font-mono text-xs text-primary font-semibold">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeConversation,
  sendMessage,
  isLoading,
  error,
  modelInfo,
}) => {
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hardcoded mock categories matching the reference screen design
  const conversationsMock = {
    today: [
      { id: '1', title: 'Explain asyncio.gather', active: true },
      { id: '2', title: 'React useMemo vs useCallback' },
    ],
    yesterday: [
      { id: '3', title: 'SQL indexes best practices' },
      { id: '4', title: 'Python list comprehension' },
    ],
    last7days: [
      { id: '5', title: 'Fix Memory Leak' },
      { id: '6', title: 'JWT authentication flow' },
      { id: '7', title: 'Docker multi-stage build' },
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modelName = modelInfo?.model_name.split('/').pop() || 'SmolLM2-360M-Instruct';

  return (
    <div className="flex-1 flex h-full bg-[#090810] min-w-0 overflow-hidden font-sans">
      
      {/* Split column 1: Conversation History List (320px width) */}
      <div className="hidden md:flex w-[280px] flex-col border-r border-[#1d1b2e] bg-[#100d20] shrink-0 overflow-y-auto select-none">
        
        {/* New Chat trigger button */}
        <div className="p-4 border-b border-[#1d1b2e] space-y-3 shrink-0">
          <button 
            onClick={() => sendMessage('Start a new clean chat session.')}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#6344d5] hover:bg-[#6344d5]/90 text-xs text-white font-bold rounded-xl cursor-pointer shadow-sm transition-all active:scale-[0.98] glow-primary"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#131121] border border-[#1d1b2e] text-xs rounded-xl pl-9.5 pr-4 py-2 outline-none text-foreground placeholder:text-[#58556f] focus:border-primary/50 focus-ring"
            />
            <Search size={13} className="absolute left-3 top-3 text-[#58556f]" />
          </div>
        </div>

        {/* Categories list */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto text-xs">
          
          {/* Today */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Today</h4>
            <div className="space-y-0.5">
              {conversationsMock.today.map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                    item.active 
                      ? 'bg-[#2b1854] text-white border border-[#6344d5]/30' 
                      : 'text-[#9d99b3] hover:text-foreground hover:bg-muted/15'
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Yesterday */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Yesterday</h4>
            <div className="space-y-0.5">
              {conversationsMock.yesterday.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left font-medium text-[#9d99b3] hover:text-foreground hover:bg-muted/15 transition-all cursor-pointer"
                >
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Last 7 days */}
          <div className="space-y-1">
            <h4 className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last 7 days</h4>
            <div className="space-y-0.5">
              {conversationsMock.last7days.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left font-medium text-[#9d99b3] hover:text-foreground hover:bg-muted/15 transition-all cursor-pointer"
                >
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Split column 2: Main chat scope */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#090810]">
        
        {/* Chat Header title */}
        <div className="h-14 flex items-center justify-between px-6 border-b border-[#1d1b2e] select-none shrink-0 bg-[#100d20]">
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">
              {activeConversation?.title && activeConversation.messages.length > 0
                ? activeConversation.title
                : 'Explain asyncio.gather'}
            </h2>
          </div>
          <div className="text-[10px] text-[#9d99b3] font-mono">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Messages Feed area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            // Preload a clean reference conversation when empty to match screen 3
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* User Bubble (Right) */}
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold select-none border shrink-0 bg-primary border-primary/20 text-primary-foreground">
                  <User size={13} />
                </div>
                <div className="space-y-1 max-w-[80%]">
                  <div className="px-4.5 py-3 rounded-2xl shadow-sm border border-[#6344d5]/30 text-sm leading-relaxed bg-[#2b1854] text-white rounded-tr-none">
                    Can you explain how asyncio.gather() works in Python?
                  </div>
                  <div className="text-[9px] text-[#58556f] text-right">10:30 AM</div>
                </div>
              </div>

              {/* AI Bubble (Left) */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold select-none border border-border bg-[#131121] text-foreground shrink-0">
                  <Shield size={13} className="text-primary" />
                </div>
                <div className="space-y-1.5 max-w-[85%]">
                  <div className="p-4.5 rounded-2xl shadow-sm border border-[#1d1b2e] text-sm leading-relaxed bg-[#131121] text-foreground rounded-tl-none">
                    <p className="mb-3 leading-relaxed">
                      `asyncio.gather()` is a powerful function in Python's `asyncio` library that allows you to run multiple coroutines concurrently and wait for all of them to complete.
                    </p>
                    <p className="mb-3 font-semibold text-white">Here's how it works:</p>

                    <MarkdownRenderer text={`\`\`\`python
# Run multiple coroutines concurrently
results = await asyncio.gather(
    fetch_data(url1),
    fetch_data(url2),
    fetch_data(url3)
)
\`\`\``} />

                    <p className="font-semibold text-white mt-3">Key points:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1 text-[#eae9fc]/90 text-xs">
                      <li>It runs all coroutines concurrently.</li>
                      <li>Returns results in the same order as the input list.</li>
                      <li>If `return_exceptions=True`, exceptions are returned instead of raised.</li>
                    </ul>
                  </div>
                  <div className="text-[9px] text-[#58556f]">10:30 AM</div>
                </div>
              </div>

            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {activeConversation.messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-4 group ${isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm select-none border shrink-0 ${
                      isUser 
                        ? 'bg-primary border-primary/20 text-primary-foreground' 
                        : 'bg-card border-border text-foreground'
                    }`}>
                      {isUser ? <User size={13} /> : <Shield size={13} className="text-primary" />}
                    </div>

                    <div className="space-y-1 max-w-[85%]">
                      <div className={`p-4 rounded-2xl shadow-sm border text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-[#2b1854] border-[#6344d5]/30 text-white rounded-tr-none' 
                          : 'bg-[#131121] border-[#1d1b2e] text-foreground rounded-tl-none'
                      }`}>
                        <MarkdownRenderer text={msg.content} />
                        
                        {!msg.content && isLoading && !isUser && (
                          <div className="flex flex-col gap-2 py-2 w-64 select-none">
                            <div className="h-3 bg-muted rounded-full animate-shimmer w-full" />
                            <div className="h-3 bg-muted rounded-full animate-shimmer w-[85%]" />
                            <div className="h-3 bg-muted rounded-full animate-shimmer w-[60%]" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mb-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2 shadow-sm shrink-0">
            <AlertCircle size={15} />
            <span className="font-semibold">Error: {error}</span>
          </div>
        )}

        {/* Input panel bottom container */}
        <div className="p-4 border-t border-[#1d1b2e] bg-[#100d20]">
          <div className="max-w-3xl mx-auto relative flex items-end gap-3 border border-[#1d1b2e] focus-within:border-primary/50 bg-[#090810] rounded-xl p-3 shadow-md transition-all">
            <button className="p-1.5 text-[#9d99b3] hover:text-white transition-colors cursor-pointer" title="Attach Code">
              <Paperclip size={14} />
            </button>
            <button className="p-1.5 text-[#9d99b3] hover:text-white transition-colors cursor-pointer" title="Paste Block">
              <Code size={14} />
            </button>
            <button className="p-1.5 text-[#9d99b3] hover:text-white transition-colors cursor-pointer" title="Record Prompt">
              <Mic size={14} />
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your code..."
              className="flex-1 max-h-[120px] min-h-[38px] resize-none outline-none border-none text-xs bg-transparent px-3.5 py-1.5 placeholder:text-[#58556f] text-white leading-relaxed font-sans"
              rows={1}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-[#6344d5] hover:bg-[#6344d5]/90 text-white disabled:bg-[#131121] disabled:text-[#58556f] rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 glow-primary shrink-0"
            >
              <Send size={13} fill={input.trim() ? "white" : "none"} />
            </button>
          </div>

          {/* Model Status info subtext */}
          <div className="max-w-3xl mx-auto flex items-center gap-2 text-[10px] text-[#9d99b3] mt-2 px-1 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>{modelName}</span>
            <span className="text-[#58556f]">•</span>
            <span>Local Inference</span>
          </div>
        </div>

      </div>

    </div>
  );
};
