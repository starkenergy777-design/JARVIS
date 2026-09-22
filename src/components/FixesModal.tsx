import React, { useState } from 'react';
import { X, CheckCircle2, AlertOctagon, Download, Copy, FileText } from 'lucide-react';
import { BUG_FIXES } from '../data/bugFixes';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface FixesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadFixedHtml: () => void;
  lang: Language;
}

export const FixesModal: React.FC<FixesModalProps> = ({
  isOpen,
  onClose,
  onDownloadFixedHtml,
  lang,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang].fixes;

  const handleCopySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 flex flex-col gap-4 text-slate-200 max-h-[90vh] my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {t.title}
              </h2>
              <p className="text-xs text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action bar */}
        <div className="bg-blue-950/40 border border-blue-800/40 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-blue-200">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>
              {t.summary.replace('{count}', String(BUG_FIXES.length))}
            </span>
          </div>
          <button
            onClick={onDownloadFixedHtml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadStandalone}</span>
          </button>
        </div>

        {/* Bug list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {BUG_FIXES.map((fix, idx) => (
            <div
              key={fix.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">{fix.title[lang]}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                    fix.severity === 'CRITICAL'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : fix.severity === 'HIGH'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  }`}
                >
                  {fix.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{fix.description[lang]}</p>

              {/* Code comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-rose-950/20 border border-rose-900/40 rounded p-2.5 overflow-x-auto text-rose-200">
                  <div className="text-[10px] font-bold text-rose-400 mb-1 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3" />
                    <span>{t.beforeLabel}</span>
                  </div>
                  <pre className="whitespace-pre-wrap">{fix.beforeSnippet}</pre>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-2.5 overflow-x-auto text-emerald-200 relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.afterLabel}</span>
                    </div>
                    <button
                      onClick={() => handleCopySnippet(fix.afterSnippet, fix.id)}
                      className="text-slate-400 hover:text-slate-200 text-[10px]"
                      title="Copy fix"
                    >
                      {copiedId === fix.id ? 'Copied!' : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap">{fix.afterSnippet}</pre>
                </div>
              </div>

              <div className="text-xs text-slate-400 italic">
                <b>{t.impactLabel}</b> {fix.impact[lang]}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
