import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Code2, Settings2, ChevronLeft, ChevronRight, LayoutDashboard, Cpu,
  History, FileText, Terminal
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'playground', label: 'Playground', icon: Code2 },
    { id: 'history', label: 'History', icon: History },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'snippets', label: 'Snippets', icon: Terminal },
    { id: 'models', label: 'Models', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <motion.aside 
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#100d20] border-r border-[#1d1b2e] flex flex-col h-screen relative select-none overflow-hidden shrink-0"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1d1b2e] flex items-center justify-between overflow-hidden shrink-0 h-16">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary glow-primary shrink-0">
            <Cpu size={16} className="animate-pulse" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col whitespace-nowrap"
              >
                <span className="font-bold text-sm tracking-tight text-foreground">
                  Antigravity
                </span>
                <span className="text-[10px] font-medium text-muted-foreground -mt-1">
                  Coder
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 shrink-0 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                isActive 
                  ? 'bg-[#2b1854] text-white border border-[#6344d5]/30' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="truncate whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-18 bg-popover border border-border text-popover-foreground text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Expand trigger when collapsed */}
      {collapsed && (
        <div className="p-4 flex justify-center shrink-0 border-t border-[#1d1b2e] mt-2">
          <button 
            onClick={() => setCollapsed(false)}
            className="text-muted-foreground hover:text-foreground p-2 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Mock User Profile Area */}
      <div className="border-t border-[#1d1b2e] bg-[#0f0c1d] shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4"
            >
              <div className="flex items-center justify-between p-2 bg-[#131121] border border-[#1d1b2e] rounded-xl shadow-sm hover:border-primary/20 transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-[#2b1854] text-white flex items-center justify-center font-bold text-xs select-none shrink-0">
                    D
                  </div>
                  <div className="flex flex-col text-[11px] truncate min-w-0">
                    <span className="font-semibold text-foreground truncate">Developer</span>
                    <span className="text-[9px] text-[#9d99b3]">Pro Plan</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted/40 shrink-0"
                  title="Settings"
                >
                  <Settings2 size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
