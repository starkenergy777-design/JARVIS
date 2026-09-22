import React, { useRef, useEffect } from 'react';
import { Play, Pause, Square, Sparkles, Send, Clock, HardDrive, Infinity } from 'lucide-react';
import { formatSize, codeSize } from '../utils/agentEngine';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface PromptBarProps {
  idea: string;
  setIdea: (val: string) => void;
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  statusText: string;
  timerSeconds: number;
  currentCycle: number;
  maxCycles: number;
  code: string;
  lang: Language;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  idea,
  setIdea,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  statusText,
  timerSeconds,
  currentCycle,
  maxCycles,
  code,
  lang,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const t = TRANSLATIONS[lang].promptBar;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [idea]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isRunning && idea.trim()) {
        onStart();
      }
    }
  };

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const isUnlimited = maxCycles === 0;
  const progressPercent = !isUnlimited && maxCycles > 0 ? (currentCycle / maxCycles) * 100 : 100;

  return (
    <div className="bg-slate-950 border-t border-slate-800 p-3 flex flex-col gap-2 shrink-0">
      {/* Status & Stats Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1.5 truncate">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning
                  ? isPaused
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
            <span className="font-medium text-slate-300 truncate">{statusText}</span>
          </span>
          {currentCycle > 0 && (
            <span className="text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono flex items-center gap-1">
              <span>{t.cycle} {currentCycle}</span>
              <span>/</span>
              {isUnlimited ? (
                <span className="flex items-center gap-0.5 text-blue-300" title={t.unlimited}>
                  <Infinity className="w-3 h-3 inline" />
                </span>
              ) : (
                <span>{maxCycles}</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
          {code && (
            <span className="flex items-center gap-1 text-slate-400">
              <HardDrive className="w-3 h-3 text-slate-500" />
              <span>{formatSize(codeSize(code))}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-blue-400 font-semibold">
            <Clock className="w-3 h-3" />
            <span>⏱️ {formatTimer(timerSeconds)}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300 ${
              isUnlimited ? 'animate-pulse' : ''
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      )}

      {/* Preset Ideas */}
      {!idea && !isRunning && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[11px] text-slate-500 shrink-0">{t.ideasLabel}</span>
          {t.sampleIdeas.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdea(preset)}
              className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-0.5 rounded whitespace-nowrap transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder={t.placeholder}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none min-h-[40px] max-h-[120px] transition-all disabled:opacity-60"
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isRunning ? (
            <>
              {isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.resume}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{t.pause}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onStop}
                className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stop}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStart}
              disabled={!idea.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.start}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
