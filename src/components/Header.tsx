import React from 'react';
import { 
  Terminal, 
  Eye, 
  Code2, 
  Settings as SettingsIcon, 
  Download, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  FileCheck2,
  RotateCcw,
  Globe
} from 'lucide-react';
import { ViewMode, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  hasCode: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onClear: () => void;
  onOpenSettings: () => void;
  onOpenFixes: () => void;
  onDownloadFixedHtml: () => void;
  isCopied: boolean;
  lastAutoSaveTime?: string | null;
  onManualBackup?: () => void;
  hasRecoverableBackup?: boolean;
  onRestoreBackup?: () => void;
  lang: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  hasCode,
  onDownload,
  onCopy,
  onClear,
  onOpenSettings,
  onOpenFixes,
  onDownloadFixedHtml,
  isCopied,
  lastAutoSaveTime,
  onManualBackup,
  hasRecoverableBackup,
  onRestoreBackup,
  lang,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[lang].header;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/40 shadow-md shadow-cyan-500/20 bg-slate-900 shrink-0">
          <img
            src="/icon.png"
            alt="Agent Pro Icon"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
              {t.production}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {t.versionTag}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {t.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {/* View Mode Switchers */}
        <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-lg flex items-center mr-1">
          <button
            onClick={() => setViewMode('logs')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'logs'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{t.terminal}</span>
          </button>

          <button
            onClick={() => setViewMode('preview')}
            disabled={!hasCode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.preview}</span>
          </button>

          <button
            onClick={() => setViewMode('code')}
            disabled={!hasCode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'code'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-40 disabled:pointer-events-none'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.code}</span>
          </button>
        </div>

        {/* Action Buttons */}
        {hasCode && (
          <>
            <button
              onClick={onCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              title={t.copy}
            >
              {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isCopied ? t.copied : t.copy}</span>
            </button>

            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-600/50 text-white transition-all shadow-sm"
              title={t.download}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.download}</span>
            </button>
          </>
        )}

        <button
          onClick={onClear}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          title={t.clear}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.clear}</span>
        </button>

        {/* Changelog & Fixes modal trigger */}
        <button
          onClick={onOpenFixes}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
          title={t.fixesListTooltip}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.fixesList}</span>
        </button>

        {/* Download Standalone Fixed HTML */}
        <button
          onClick={onDownloadFixedHtml}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 transition-all"
          title={t.standaloneTooltip}
        >
          <Download className="w-3.5 h-3.5" />
          <span>agent-pro.html</span>
        </button>

        {/* Auto-Save Indicator & Manual Trigger */}
        <button
          onClick={onManualBackup}
          className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          title={t.autoSaveTooltip}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t.autoSave}</span>
          {lastAutoSaveTime ? (
            <span className="text-emerald-400/90 font-mono text-[10px]">({lastAutoSaveTime})</span>
          ) : (
            <span className="text-slate-500 text-[10px]">60s</span>
          )}
        </button>

        {/* Restore Auto-Save Backup Button (if available) */}
        {hasRecoverableBackup && onRestoreBackup && (
          <button
            onClick={onRestoreBackup}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all animate-pulse"
            title={t.restoreBackupTooltip}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.restoreBackup}</span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
          title={t.settings}
        >
          <SettingsIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>{t.settings}</span>
        </button>

        {/* Prominent Language Switcher */}
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 border border-cyan-500/40 text-cyan-200 shadow-sm shadow-cyan-950/30 transition-all"
          title={t.langTooltip}
          aria-label="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono tracking-wider">{lang === 'ka' ? '🇬🇪 KA' : '🇺🇸 EN'}</span>
        </button>
      </div>
    </header>
  );
};
