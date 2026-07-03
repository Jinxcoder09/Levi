import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useChat } from './hooks/useChat';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { CodePlayground } from './components/CodePlayground';
import { Settings } from './components/Settings';
import { AboutPage } from './components/AboutPage';

export const App: React.FC = () => {
  const {
    activeConversation,
    settings,
    modelInfo,
    isLoading,
    error,
    updateSettings,
    createNewConversation,
    sendMessage,
    executeCodeAction,
    clearHistory,
  } = useChat();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const selectTabFromNav = (tab: string) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans">
      
      {/* 1. Sidebar Navigation (Desktop only, hidden on lg screens down) */}
      <div className="hidden lg:block h-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={selectTabFromNav}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* 2. Responsive Overlay Drawer Sidebar (Mobile / Tablet) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative"
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={selectTabFromNav}
                collapsed={false}
                setCollapsed={() => {}}
              />
              {/* Close trigger overlay inside the sidebar */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
              </button>
            </motion.div>
            {/* Backdrop shadow space clicking closer */}
            <div className="flex-1 h-full" onClick={() => setMobileSidebarOpen(false)}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main content frame (Contains sticky header and tabs) */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Navbar
          activeTab={activeTab}
          modelInfo={modelInfo}
          settings={settings}
          updateSettings={updateSettings}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  modelInfo={modelInfo}
                  setActiveTab={selectTabFromNav}
                  createNewConversation={createNewConversation}
                  sendMessage={sendMessage}
                />
              )}

              {activeTab === 'chat' && (
                <ChatInterface
                  activeConversation={activeConversation}
                  sendMessage={sendMessage}
                  isLoading={isLoading}
                  error={error}
                  modelInfo={modelInfo}
                />
              )}

              {activeTab === 'playground' && (
                <CodePlayground
                  executeCodeAction={executeCodeAction}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'settings' && (
                <Settings
                  settings={settings}
                  updateSettings={updateSettings}
                  clearHistory={clearHistory}
                  modelInfo={modelInfo}
                />
              )}

              {activeTab === 'about' && (
                <AboutPage />
              )}

              {/* Placeholder tabs for nav items not yet implemented */}
              {['history', 'documents', 'snippets', 'models'].includes(activeTab) && (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#090810] text-center p-8 space-y-4 select-none">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold text-white capitalize">{activeTab}</h2>
                    <p className="text-xs text-[#9d99b3] max-w-xs">This section is coming soon. Core chat and playground features are fully available.</p>
                  </div>
                  <button
                    onClick={() => selectTabFromNav('dashboard')}
                    className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold rounded-xl cursor-pointer transition-all"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
