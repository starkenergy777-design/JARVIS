import React, { useState } from 'react';
import { Copy, CheckCircle2, Download, FileCode } from 'lucide-react';
import { formatSize, codeSize } from '../utils/agentEngine';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface CodeViewProps {
  code: string;
  fileName: string;
  onDownload: () => void;
  lang: Language;
}

export const CodeView: React.FC<CodeViewProps> = ({ code, fileName, onDownload, lang }) => {
  const [copied, setCopied] = useState(false);
  const t = TRANSLATIONS[lang].codeView;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lines = code ? code.split('\n') : [];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-lg overflow-hidden min-h-0">
      <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-slate-200">{fileName}</span>
          <span className="text-slate-500">
            ({lines.length} {t.lines}, {formatSize(codeSize(code))})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-[11px]"
          >
            {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? t.copied : t.copy}</span>
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white transition-colors text-[11px]"
          >
            <Download className="w-3 h-3" />
            <span>{t.download}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 font-mono text-xs text-slate-300 leading-relaxed selection:bg-blue-600/30">
        {lines.length === 0 ? (
          <div className="text-slate-500 italic">{t.noCode}</div>
        ) : (
          <div className="table w-full">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-900/60">
                <span className="table-cell pr-4 text-right select-none text-slate-600 text-[11px] w-12">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre-wrap break-all font-mono">
                  {line || ' '}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
