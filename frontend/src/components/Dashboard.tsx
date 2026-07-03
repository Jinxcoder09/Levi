import React from 'react';
import { 
  MessageSquare, Code, FileText, ShieldAlert, List, RefreshCw,
  Cpu, HardDrive, Database
} from 'lucide-react';
import type { ModelInfo } from '../types';

interface DashboardProps {
  modelInfo: ModelInfo | null;
  setActiveTab: (tab: string) => void;
  createNewConversation: (title?: string) => void;
  sendMessage: (msg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  modelInfo,
  setActiveTab,
  createNewConversation,
  sendMessage,
}) => {
  const quickActions = [
    { id: 'chat', title: 'AI Chat', desc: 'Chat with your AI assistant', icon: MessageSquare },
    { id: 'playground', title: 'Playground', desc: 'Run code and experiments', icon: Code },
    { id: 'explain', title: 'Explain Code', desc: 'Get detailed explanations', icon: FileText, prompt: 'Explain how this code block functions and list edge cases:\n\n' },
    { id: 'debug', title: 'Debug Code', desc: 'Find and fix issues', icon: ShieldAlert, prompt: 'Find bugs and syntax errors in this code block:\n\n' },
    { id: 'tests', title: 'Generate Tests', desc: 'Create unit tests', icon: List, prompt: 'Write comprehensive unit tests for this code block:\n\n' },
    { id: 'refactor', title: 'Refactor Code', desc: 'Improve code quality', icon: RefreshCw, prompt: 'Refactor this code block to improve readability and complexity:\n\n' },
  ];

  const recentConversations = [
    { title: 'Python async queue implementation', time: '2 mins ago' },
    { title: 'React custom hook optimization', time: '28 mins ago' },
    { title: 'SQL query performance tuning', time: '1 hour ago' },
    { title: 'Debug memory leak in Node.js', time: '3 hours ago' },
    { title: 'Implement auth with JWT', time: '5 hours ago' },
  ];

  const examplePrompts = [
    { label: 'Explain this code', prompt: 'Explain the runtime complexity of this function:\n\n', icon: FileText },
    { label: 'Write a Python function', prompt: 'Write a Python function to check if a string is a palindrome.', icon: Code },
    { label: 'Debug this error', prompt: 'Explain how to fix this TypeError exception:\n\n', icon: ShieldAlert },
    { label: 'Optimize this SQL query', prompt: 'Optimize this slow SQL query using proper indexes:\n\n', icon: Database },
    { label: 'Generate unit tests', prompt: 'Generate unit tests for a standard user authentication class.', icon: List },
  ];

  const handleActionClick = (action: typeof quickActions[0]) => {
    if (action.id === 'chat') {
      createNewConversation();
      setActiveTab('chat');
    } else if (action.id === 'playground') {
      setActiveTab('playground');
    } else if (action.prompt) {
      createNewConversation(action.title);
      setActiveTab('chat');
      setTimeout(() => {
        sendMessage(action.prompt || '');
      }, 100);
    }
  };

  const handlePromptClick = (label: string, promptText: string) => {
    createNewConversation(label);
    setActiveTab('chat');
    setTimeout(() => {
      sendMessage(promptText);
    }, 100);
  };

  const modelName = modelInfo?.model_name || 'SmolLM2-360M-Q4_K_M';

  return (
    <div className="flex-1 overflow-y-auto bg-[#090810] p-6 space-y-6 font-sans max-w-[1400px] mx-auto w-full">
      
      {/* Welcome Row with status badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1d1b2e] pb-5 select-none">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back, Developer 👋</h1>
          <p className="text-xs text-[#9d99b3]">Your AI Coding Assistant is ready to help you build, debug and ship faster.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#131121] border border-[#1d1b2e] rounded-xl text-xs">
            <span className="text-[#9d99b3]">LOCAL MODEL:</span>
            <span className="font-semibold font-mono text-primary">{modelName}</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#131121] border border-[#1d1b2e] rounded-xl text-xs">
            <span className="text-[#9d99b3]">SYSTEM STATUS:</span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Healthy
            </span>
          </div>
        </div>
      </div>

      {/* Grid: System Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 select-none">
        
        {/* Model Status Card */}
        <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl flex flex-col gap-4 min-h-[110px] hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Model</span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Cpu size={14} />
            </div>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-end">
            <h2 className="text-sm font-bold truncate text-white">{modelName}</h2>
            <p className="text-[10px] text-emerald-500 font-semibold">Local Inference</p>
          </div>
        </div>

        {/* Memory Card */}
        <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl flex flex-col gap-4 min-h-[110px] hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Model Size</span>
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
              <HardDrive size={14} />
            </div>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-end">
            <h2 className="text-sm font-bold text-white">~180 MB</h2>
            <p className="text-[10px] text-[#58556f]">Q4_K_M quantized</p>
          </div>
        </div>

        {/* Context Card */}
        <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl flex flex-col gap-4 min-h-[110px] hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Context</span>
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <RefreshCw size={14} />
            </div>
          </div>
          <div className="space-y-1 flex-1 flex flex-col justify-end">
            <h2 className="text-xl font-bold text-white">512</h2>
            <p className="text-[10px] text-[#58556f]">Tokens context window</p>
          </div>
        </div>

      </div>

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left: Quick Actions Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="select-none">
            <h3 className="text-sm font-bold text-white">Quick Actions</h3>
            <p className="text-[10px] text-[#9d99b3] mt-0.5">Choose a tool to get started</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action)}
                  className="flex items-center gap-3.5 p-4 bg-[#131121] hover:bg-[#1c1a30] border border-[#1d1b2e] hover:border-primary/40 rounded-xl text-left transition-all duration-200 cursor-pointer shadow-sm group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg text-primary glow-primary shrink-0 group-hover:scale-105 transition-transform">
                    <Icon size={15} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-bold text-xs text-white group-hover:text-primary transition-colors">{action.title}</h4>
                    <p className="text-[10px] text-[#9d99b3] leading-relaxed truncate">{action.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Recent Conversations */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          <div className="flex items-center justify-between select-none">
            <h3 className="text-sm font-bold text-white">Recent Conversations</h3>
            <button 
              onClick={() => setActiveTab('chat')}
              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="flex-1 bg-[#131121] border border-[#1d1b2e] rounded-2xl overflow-hidden select-none">
            {recentConversations.map((conv, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between px-4 py-3 border-b border-[#1d1b2e] last:border-0 hover:bg-[#1c1a30] cursor-pointer transition-colors gap-4"
                onClick={() => { createNewConversation(conv.title); setActiveTab('chat'); }}
              >
                <span className="text-xs font-medium text-[#eae9fc] truncate min-w-0 flex-1">{conv.title}</span>
                <span className="text-[10px] text-[#58556f] font-mono shrink-0 whitespace-nowrap">{conv.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom: Example Prompts */}
      <div className="space-y-4 pt-2">
        <div className="select-none">
          <h3 className="text-sm font-bold text-white">Example Prompts</h3>
          <p className="text-[10px] text-[#9d99b3] mt-0.5">Try these examples to get started</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {examplePrompts.map((ep, idx) => {
            const Icon = ep.icon;
            return (
              <button
                key={idx}
                onClick={() => handlePromptClick(ep.label, ep.prompt)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-[#131121] hover:bg-[#1c1a30] border border-[#1d1b2e] hover:border-primary/40 text-xs text-[#eae9fc] font-medium rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Icon size={12} className="text-[#9d99b3]" />
                <span>{ep.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
