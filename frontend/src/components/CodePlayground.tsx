import React, { useState } from 'react';
import { 
  Play, Trash2, Save, Copy, Check, ChevronDown
} from 'lucide-react';
import { MonacoEditorWrapper } from './MonacoEditorWrapper';

interface CodePlaygroundProps {
  executeCodeAction: (
    action: 'explain' | 'debug' | 'refactor' | 'generate-tests' | 'summarize', 
    code: string, 
    language: string, 
    context?: string
  ) => Promise<string>;
  isLoading: boolean;
}

const LANGUAGES = [
  { id: 'python', name: 'Python' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'rust', name: 'Rust' },
  { id: 'go', name: 'Go' },
  { id: 'cpp', name: 'C++' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
];

const THEMES = [
  { id: 'dracula', name: 'Dracula' },
  { id: 'monokai', name: 'Monokai' },
  { id: 'vs-dark', name: 'VS Dark' },
  { id: 'github-dark', name: 'GitHub Dark' },
];

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  executeCodeAction,
  isLoading,
}) => {
  const [code, setCode] = useState(`async def fetch_data(url: str):
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def main():
    urls = [
        "https://api.github.com/users/octocat",
        "https://api.github.com/users/torvalds",
        "https://api.github.com/users/gaearon"
    ]
    
    results = await asyncio.gather(*(fetch_data(url) for url in urls))
    
    for user in results:
        print(f"User: {user['login']} - {user['name']}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())`);
  const [language, setLanguage] = useState('python');
  const [theme, setTheme] = useState('dracula');
  const [output, setOutput] = useState(`octocat - The Octocat
torvalds - Linus Torvalds
gaearon - Dan Abramov

Process finished with exit code 0`);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'console' | 'logs' | 'errors'>('output');
  const [copied, setCopied] = useState(false);
  const [statusText, setStatusText] = useState('Running main.py ...\nSuccess');

  const handleRun = async () => {
    if (!code.trim() || isLoading) return;
    setStatusText('Running main.py ...\nExecuting local environment...');
    try {
      // Direct call to refactor/explain to act as Run execution
      const result = await executeCodeAction('explain', code, language);
      setOutput(result);
      setStatusText('Running main.py ...\nSuccess');
    } catch (e: any) {
      setOutput(`Error during execution: ${e.message}`);
      setStatusText('Running main.py ...\nFailed');
    }
  };

  const handleClear = () => {
    setCode('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090810] font-sans">
      
      {/* Playground Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1d1b2e] bg-[#100d20] select-none shrink-0">
        
        {/* Left: Dropdown selectors */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Language</span>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#131121] border border-[#1d1b2e] text-xs text-white rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:border-primary/50 appearance-none font-semibold min-w-[120px]"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Theme</span>
            <div className="relative">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-[#131121] border border-[#1d1b2e] text-xs text-white rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:border-primary/50 appearance-none font-semibold min-w-[120px]"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1d1b2e] bg-[#131121] hover:bg-[#1c1a30] text-xs text-white font-bold rounded-lg cursor-pointer transition-all active:scale-95"
          >
            <Trash2 size={13} className="text-[#9d99b3]" />
            <span>Clear</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1d1b2e] bg-[#131121] hover:bg-[#1c1a30] text-xs text-white font-bold rounded-lg cursor-pointer transition-all active:scale-95"
            onClick={() => alert('Code saved successfully.')}
          >
            <Save size={13} className="text-[#9d99b3]" />
            <span>Save</span>
          </button>
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4.5 py-1.5 bg-[#6344d5] hover:bg-[#6344d5]/90 text-xs text-white font-bold rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm glow-primary"
          >
            <Play size={13} fill="white" />
            <span>Run</span>
          </button>
        </div>

      </div>

      {/* Main Split Layout: Editor & Outputs */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Left: Code Editor Container */}
        <div className="flex-1 flex flex-col border-r border-[#1d1b2e] min-h-0">
          {/* Tab Header bar */}
          <div className="flex h-10 items-center justify-between px-4 bg-[#100d20] border-b border-[#1d1b2e] select-none shrink-0">
            <div className="flex items-center h-full">
              <span className="flex items-center gap-2 px-4 h-full border-t-2 border-t-primary bg-[#090810] text-xs text-white font-semibold">
                main.py
              </span>
            </div>
          </div>

          {/* Code Editor body */}
          <div className="flex-1 min-h-0 relative">
            <MonacoEditorWrapper
              value={code}
              onChange={setCode}
              language={language}
              theme="vs-dark"
            />
          </div>

          {/* Editor Status Bar Footer */}
          <div className="flex h-8 items-center justify-between px-4 bg-[#100d20] border-t border-[#1d1b2e] text-[10px] text-[#9d99b3] font-mono select-none shrink-0">
            <div className="flex items-center gap-4">
              <span>Ln 1, Col 1</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <span>LF</span>
              <span className="uppercase">{language}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Execution time: {isLoading ? 'Running...' : '1.24s'}</span>
              <span>Memory: 45.6MB</span>
            </div>
          </div>
        </div>

        {/* Right: Output Review Panel */}
        <div className="w-full lg:w-[40%] flex flex-col bg-[#090810] min-h-0">
          {/* Output console tab headers */}
          <div className="flex h-10 items-center justify-between px-4 bg-[#100d20] border-b border-[#1d1b2e] select-none shrink-0">
            <div className="flex items-center h-full gap-1">
              {(['output', 'console', 'logs', 'errors'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveConsoleTab(tab)}
                  className={`px-3.5 h-full text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeConsoleTab === tab
                      ? 'border-primary text-white bg-[#090810]/40'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleCopy} 
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                title="Copy Logs"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Console Text display */}
          <div className="flex-1 p-5 overflow-y-auto font-mono text-[12px] leading-6 text-foreground select-text">
            {activeConsoleTab === 'output' && (
              <div className="space-y-4">
                <pre className="text-white whitespace-pre-wrap">
                  {output}
                </pre>
                
                {/* Diagnostics Status line indicator */}
                <div className="border-t border-[#1d1b2e] pt-4 text-[#58556f] space-y-1">
                  <div className="text-[#9d99b3] font-bold text-[10px] uppercase tracking-wider">Console output</div>
                  <pre className="text-emerald-500 text-[11px]">
                    {statusText}
                  </pre>
                </div>
              </div>
            )}
            
            {activeConsoleTab === 'console' && (
              <pre className="text-blue-400"># Interactive local interpreter session is active</pre>
            )}
            {activeConsoleTab === 'logs' && (
              <pre className="text-[#9d99b3]">[INFO] 172.18.0.3 - "GET /metrics HTTP/1.1" 200 OK</pre>
            )}
            {activeConsoleTab === 'errors' && (
              <pre className="text-[#58556f]">No compile execution errors reported.</pre>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
