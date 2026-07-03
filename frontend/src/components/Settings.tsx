import React, { useState } from 'react';
import { Save, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { AppSettings, ModelInfo } from '../types';

interface SettingsProps {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearHistory: () => void;
  modelInfo: ModelInfo | null;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  updateSettings,
  clearHistory,
  modelInfo,
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirmClear) {
      setResetting(true);
      setTimeout(() => {
        clearHistory();
        setConfirmClear(false);
        setResetting(false);
        alert('Conversation history cleared.');
      }, 800);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#090810] p-6 lg:p-8 font-sans select-none">
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-5 bg-[#131121] border border-[#1d1b2e] p-6 rounded-2xl">
          <div className="border-b border-[#1d1b2e] pb-4">
            <h2 className="text-md font-bold text-white tracking-tight">Generation Settings</h2>
            <p className="text-[10px] text-[#9d99b3] mt-0.5">Configure how the AI model generates responses.</p>
          </div>
          <div className="space-y-5 pt-1">

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Model</label>
              <div className="bg-[#090810] border border-[#1d1b2e] text-xs text-white rounded-xl px-3 py-2.5 font-mono">
                SmolLM2-360M-Instruct-Q4_K_M.gguf
              </div>
            </div>

            <div className="h-px bg-[#1d1b2e] my-2"></div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Temperature</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.temperature}</span>
              </div>
              <input
                type="range" min="0.1" max="1.5" step="0.1"
                value={settings.temperature}
                onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Max Tokens</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.maxTokens}</span>
              </div>
              <input
                type="range" min="64" max="2048" step="64"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Top P</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.topP}</span>
              </div>
              <input
                type="range" min="0.1" max="1.0" step="0.05"
                value={settings.topP}
                onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="h-px bg-[#1d1b2e] my-2"></div>

            <div className="flex items-center justify-between py-1.5">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-white" htmlFor="stream-switch">Stream Response</label>
                <p className="text-[10px] text-[#9d99b3]">Stream tokens as they are generated.</p>
              </div>
              <input type="checkbox" id="stream-switch"
                checked={settings.streaming}
                onChange={(e) => updateSettings({ streaming: e.target.checked })}
                className="w-4.5 h-4.5 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end pt-3">
              <button onClick={handleSave}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6344d5] hover:bg-[#6344d5]/95 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
              >
                {saveSuccess ? <><CheckCircle2 size={13} /><span>Saved</span></> : <><Save size={13} /><span>Save Settings</span></>}
              </button>
            </div>

          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#1d1b2e] pb-3">Model Information</h3>
            <div className="space-y-3.5 text-xs select-none">
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Model</span>
                <span className="font-semibold text-white font-mono text-[11px]">{modelInfo?.model_name || 'SmolLM2-360M-Q4_K_M'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Status</span>
                <span className="font-semibold text-emerald-500 text-[11px]">{modelInfo?.status || 'loaded'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Quantization</span>
                <span className="font-semibold text-white font-mono text-[11px]">Q4_K_M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Disk Size</span>
                <span className="font-semibold text-white font-mono text-[11px]">~180 MB</span>
              </div>
            </div>
          </div>

          {/* Danger zone log clear button */}
          <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl space-y-3 select-none">
            <h3 className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Reset Cache
            </h3>
            
            <button
              onClick={handleClearHistory}
              disabled={resetting}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 border rounded-xl font-bold text-xs transition-all cursor-pointer ${
                confirmClear 
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent animate-pulse'
                  : 'bg-destructive/10 hover:bg-destructive/20 border-destructive/20 text-destructive'
              }`}
            >
              {resetting ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Reseting...</span>
                </>
              ) : (
                <>
                  <span>{confirmClear ? 'Confirm Reset' : 'Reset Database Records'}</span>
                </>
              )}
            </button>
            {confirmClear && !resetting && (
              <button 
                onClick={() => setConfirmClear(false)}
                className="w-full text-center text-[10px] hover:underline text-muted-foreground block py-1 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
