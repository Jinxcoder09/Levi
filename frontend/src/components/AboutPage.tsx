import React from 'react';
import { Info, Cpu, Code, BookOpen, HardDrive, Share2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 lg:p-8 space-y-8 select-none">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <span className="p-2 bg-primary/10 rounded-xl text-primary">
          <Info size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">About Antigravity AI Coder</h1>
          <p className="text-xs text-muted-foreground">Learn about the architecture and technologies running under the hood.</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Cpu size={18} className="text-primary" />
            Hybrid Local/Cloud Architecture
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Antigravity Coder is built on a cascading inference pipeline. It is configured to run the state-of-the-art <strong>Qwen2.5-Coder-0.5B-Instruct</strong> model locally in GGUF format using <code>llama-cpp-python</code>. 
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If the application is deployed on cloud hosts with restricted memory boundaries (e.g. Render Free, Railway Starter), the backend automatically and transparently switches to the <strong>Hugging Face Serverless Inference API</strong>, guaranteeing high-performance execution without needing a local GPU or extensive memory budgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Code size={16} className="text-primary" />
              Qwen2.5-Coder Engine
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leverages the Qwen2.5-Coder 0.5B Instruct model, specifically fine-tuned for code generation, mathematical logic, bug fixing, and language formatting in dozens of programming languages.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <HardDrive size={16} className="text-primary" />
              GGUF Quantization
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quantized in Q4_K_M (4-bit quantization). Reduces the weights size to under 400MB and fits comfortably within 1.5GB system RAM, providing blazing-fast local processing speed.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <BookOpen size={16} className="text-primary" />
              Monaco Code Editor
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrates the VS Code core editor (Monaco), delivering built-in code formatting, syntax highlighting, search/replace, and advanced editing features directly inside the Playground.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Share2 size={16} className="text-primary" />
              Cloud Container Ready
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dockerized with independent backend and frontend packages, fully prepared for automated pipeline deployment on Railway, Render, and Fly.io.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4">
          Antigravity AI Coding Assistant © 2026. Made with Google DeepMind Advanced Agentic Coding.
        </div>
      </div>
    </div>
  );
};
