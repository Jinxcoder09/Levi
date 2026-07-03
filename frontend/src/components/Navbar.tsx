import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Search, Sun, Moon, Cpu, Globe, 
  CheckCircle2, AlertCircle, HelpCircle 
} from 'lucide-react';
import type { ModelInfo, AppSettings } from '../types';

interface NavbarProps {
  activeTab: string;
  modelInfo: ModelInfo | null;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  onSearchClick?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  modelInfo,
  settings,
  updateSettings,
  onSearchClick,
  onOpenMobileSidebar,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'chat': return 'AI Chat Console';
      case 'playground': return 'Code Playground';
      case 'history': return 'History';
      case 'documents': return 'Documents';
      case 'snippets': return 'Snippets';
      case 'models': return 'Models';
      case 'settings': return 'System Settings';
      case 'about': return 'About';
      default: return 'Dashboard';
    }
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b border-border bg-card/60 backdrop-blur-md select-none shrink-0"
    >
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        
        {/* Left Section: Breadcrumb/Page Title */}
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
            </button>
          )}
          <span className="text-[#9d99b3] text-xs">‹</span>
          <h1 className="text-sm font-bold tracking-tight text-foreground">{getTabTitle()}</h1>
        </div>

        {/* Middle Section: Mock Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <div 
            onClick={onSearchClick}
            className="w-full flex items-center justify-between px-3 py-2 bg-background hover:bg-muted/30 border border-border focus-within:border-primary/50 rounded-xl text-xs text-muted-foreground transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Quick search prompts...</span>
            </div>
            <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right Section: Diagnostics Status Controls */}
        <div className="flex items-center gap-3">
          
          {/* Connection badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full text-[10px] font-semibold text-muted-foreground">
            {modelInfo?.status === 'loaded' ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-bold uppercase tracking-wider">Online</span>
              </>
            ) : modelInfo?.status === 'loading' ? (
              <>
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-500 font-bold uppercase tracking-wider">Syncing</span>
              </>
            ) : (
              <>
                <AlertCircle size={12} className="text-muted-foreground" />
                <span className="font-bold uppercase tracking-wider">Offline</span>
              </>
            )}
          </div>

          {/* Model info indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border rounded-full text-xs font-semibold text-foreground">
            <Cpu size={13} className="text-primary animate-pulse" />
            <span className="truncate max-w-[120px] font-mono text-[11px]">
              {modelInfo?.model_name.split('/').pop() || 'SmolLM2-360M'}
            </span>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block"></div>

          {/* Notifications Trigger */}
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          </button>

          {/* Theme Selector */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            title={settings.theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          >
            {settings.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* User Profile avatar */}
          <div className="h-8 w-8 rounded-full border border-border bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm cursor-pointer hover:border-primary/50 transition-colors select-none">
            AC
          </div>
        </div>

      </div>
    </motion.header>
  );
};
