import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';

interface MonacoEditorWrapperProps {
  value: string;
  onChange: (val: string) => void;
  language: string;
  theme?: 'vs-dark' | 'light';
  height?: string;
  readOnly?: boolean;
}

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  value,
  onChange,
  language,
  theme = 'vs-dark',
  height = '100%',
  readOnly = false,
}) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme('antigravity-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff79c6' },
        { token: 'string', foreground: 'f1fa8c' },
        { token: 'number', foreground: 'bd93f9' },
        { token: 'regexp', foreground: 'ffb86c' },
        { token: 'type', foreground: '8be9fd' },
      ],
      colors: {
        'editor.background': '#0b0f19',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#3b82f6',
        'editor.lineHighlightBackground': '#1e293b50',
        'editorCursor.foreground': '#3b82f6',
      },
    });

    monaco.editor.setTheme(theme === 'vs-dark' ? 'antigravity-dark' : 'light');
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="w-full h-full min-h-[300px] border border-border rounded-xl overflow-hidden shadow-sm">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full bg-card text-muted-foreground text-xs gap-2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            Loading editor assets...
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Courier New', monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          padding: { top: 12, bottom: 12 },
          wordWrap: 'on',
        }}
      />
    </div>
  );
};
