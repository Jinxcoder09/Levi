import React, { useState } from 'react';
import { 
  Cpu, Sliders, AlertTriangle, ShieldCheck, Save, CheckCircle2,
  HardDrive, Info, Activity, RefreshCw
} from 'lucide-react';
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
        alert('Local database log history has been successfully reset.');
      }, 800);
    } else {
      setConfirmClear(true);
    }
  };

  // Safe formatting variables matching image specifications
  const memoryUsed = modelInfo?.memory_usage_gb || 1.53;
  const memoryTotal = modelInfo?.total_memory_gb || 7.65;
  const memoryPercent = Math.min(100, Math.round((memoryUsed / memoryTotal) * 100)) || 20;

  return (
    <div className="flex-1 overflow-y-auto bg-[#090810] p-6 lg:p-8 font-sans select-none">
      
      {/* Settings Split Layout grid */}
      <div className="max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Left Column Form (3/5 width) */}
        <div className="lg:col-span-3 space-y-5 bg-[#131121] border border-[#1d1b2e] p-6 rounded-2xl">
          
          <div className="border-b border-[#1d1b2e] pb-4">
            <h2 className="text-md font-bold text-white tracking-tight">Model & Inference</h2>
            <p className="text-[10px] text-[#9d99b3] mt-0.5">Configure how the AI model runs and generates responses.</p>
          </div>

          <div className="space-y-5 pt-1">
            
            {/* Inference Mode selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Inference Mode</label>
              <select
                className="w-full bg-[#090810] border border-[#1d1b2e] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-semibold cursor-pointer"
                disabled
              >
                <option>Local Inference</option>
              </select>
            </div>

            {/* Target model selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center select-none">
                <label className="text-[10px] font-bold text-[#9d99b3] uppercase tracking-wider">Model</label>
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded">
                  <CheckCircle2 size={10} />
                  Loaded
                </span>
              </div>
              <select
                className="w-full bg-[#090810] border border-[#1d1b2e] text-xs text-white rounded-xl px-3 py-2.5 outline-none font-mono cursor-default"
                disabled
              >
                <option>{modelInfo?.local_model_path.split('/').pop() || 'SmolLM2-360M-Instruct-Q4_K_M.gguf'}</option>
              </select>
            </div>

            <div className="h-px bg-[#1d1b2e] my-2"></div>

            {/* Context length slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Context Length</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.contextLength}</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={settings.contextLength}
                onChange={(e) => updateSettings({ contextLength: parseInt(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
              <p className="text-[9px] text-[#9d99b3]">Maximum context length constraints for the model.</p>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Temperature</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
              <p className="text-[9px] text-[#9d99b3]">Controls randomness in responses.</p>
            </div>

            {/* Max Output Tokens Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Max Tokens</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.maxTokens}</span>
              </div>
              <input
                type="range"
                min="64"
                max="2048"
                step="64"
                value={settings.maxTokens}
                onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
              <p className="text-[9px] text-[#9d99b3]">Maximum tokens in the response.</p>
            </div>

            {/* Top P Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white">Top P</span>
                <span className="text-primary font-mono text-[11px] bg-primary/10 px-2 py-0.5 rounded">{settings.topP}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.topP}
                onChange={(e) => updateSettings({ topP: parseFloat(e.target.value) })}
                className="w-full accent-primary h-1 bg-[#090810] rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
              <p className="text-[9px] text-[#9d99b3]">Nucleus sampling probability parameter.</p>
            </div>

            <div className="h-px bg-[#1d1b2e] my-2"></div>

            {/* Stream response switch */}
            <div className="flex items-center justify-between py-1.5">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-white cursor-pointer" htmlFor="stream-switch">
                  Stream Response
                </label>
                <p className="text-[10px] text-[#9d99b3]">Stream tokens as they are generated.</p>
              </div>
              <input
                type="checkbox"
                id="stream-switch"
                checked={settings.streaming}
                onChange={(e) => updateSettings({ streaming: e.target.checked })}
                className="w-4.5 h-4.5 rounded text-primary focus:ring-primary accent-primary bg-background border-border cursor-pointer focus-ring"
              />
            </div>

            {/* Keep history switch */}
            <div className="flex items-center justify-between py-1.5">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-white cursor-pointer" htmlFor="history-switch">
                  Keep Conversation History
                </label>
                <p className="text-[10px] text-[#9d99b3]">Maintain conversation history log records in memory.</p>
              </div>
              <input
                type="checkbox"
                id="history-switch"
                checked={true}
                readOnly
                className="w-4.5 h-4.5 rounded text-primary focus:ring-primary accent-primary bg-background border-border cursor-pointer focus-ring"
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-3">
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6344d5] hover:bg-[#6344d5]/95 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer glow-primary"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Settings Saved</span>
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column Stats (2/5 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Model Information metadata */}
          <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 select-none border-b border-[#1d1b2e] pb-3">
              <Info size={13} className="text-primary" />
              Model Information
            </h3>
            <div className="space-y-3.5 text-xs select-none">
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Model Name</span>
                <span className="font-semibold text-white font-mono text-[11px] truncate max-w-[140px]">{modelInfo?.model_name.split('/').pop() || 'SmolLM2-360M-Instruct'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Quantization</span>
                <span className="font-semibold text-white font-mono text-[11px]">Q4_K_M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Model Size</span>
                <span className="font-semibold text-white font-mono text-[11px]">1.6 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Context Length</span>
                <span className="font-semibold text-white font-mono text-[11px]">4096</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Vocabulary Size</span>
                <span className="font-semibold text-white font-mono text-[11px]">151,936</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9d99b3]">Architecture</span>
                <span className="font-semibold text-white font-mono text-[11px]">Transformers</span>
              </div>
            </div>
          </div>

          {/* System resource bars */}
          <div className="bg-[#131121] border border-[#1d1b2e] p-5 rounded-2xl space-y-5 select-none">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1d1b2e] pb-3">
              <Activity size={13} className="text-primary" />
              System Resources
            </h3>
            
            {/* RAM Usage progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#9d99b3]">RAM Usage</span>
                <span className="text-white font-mono">{memoryPercent}%</span>
              </div>
              <div className="w-full bg-[#090810] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${memoryPercent}%` }}></div>
              </div>
              <div className="text-[10px] text-[#58556f]">{memoryUsed.toFixed(2)} GB / {memoryTotal.toFixed(2)} GB</div>
            </div>

            {/* CPU Usage progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#9d99b3]">CPU Usage</span>
                <span className="text-white font-mono">12%</span>
              </div>
              <div className="w-full bg-[#090810] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#6344d5] h-full" style={{ width: '12%' }}></div>
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
