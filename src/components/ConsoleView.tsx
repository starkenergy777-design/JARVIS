import React, { useEffect, useRef } from 'react';
import { LogEntry, Language } from '../types';
import { Terminal, Copy, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';

interface ConsoleViewProps {
  logs: LogEntry[];
  rawText: string;
  lang: Language;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({ logs, rawText, lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const t = TRANSLATIONS[lang].console;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, rawText]);

  const handleCopyLogs = () => {
    const textToCopy = rawText || logs.map((l) => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-rose-400 font-semibold';
      case 'warn':
        return 'text-amber-300';
      case 'cycle':
        return 'text-blue-400 font-bold';
      case 'audit':
        return 'text-purple-300';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="relative flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-lg overflow-hidden min-h-0">
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[11px]">{t.stdoutLabel}</span>
        </div>
        <button
          onClick={handleCopyLogs}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? t.copied : t.copyLogs}</span>
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed space-y-1 selection:bg-blue-600/30 selection:text-blue-200"
      >
        {logs.length === 0 && !rawText && (
          <div className="text-slate-500 italic py-4">
            {t.emptyPlaceholder}
          </div>
        )}

        {rawText && (
          <div className="whitespace-pre-wrap break-words text-slate-300">
            {rawText}
          </div>
        )}

        {!rawText &&
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 break-words">
              <span className="text-slate-600 text-[10px] select-none shrink-0 pt-0.5">
                {log.time}
              </span>
              <span className={`${getLogStyle(log.type)} whitespace-pre-wrap`}>
                {log.text}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};
