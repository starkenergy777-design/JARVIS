import React, { useState, useEffect, useRef } from 'react';
import { AgentConfig, LogEntry, ViewMode, AutoSaveBackup, Language } from './types';
import { Header } from './components/Header';
import { ConsoleView } from './components/ConsoleView';
import { PreviewStage } from './components/PreviewStage';
import { CodeView } from './components/CodeView';
import { SettingsModal } from './components/SettingsModal';
import { FixesModal } from './components/FixesModal';
import { PromptBar } from './components/PromptBar';
import { TRANSLATIONS } from './i18n/translations';
import { 
  callAI, 
  extractCode, 
  truncate, 
  formatSize, 
  codeSize, 
  sanitizeFileName,
  evaluateAuditVerdict,
  resolveEffectiveConfig 
} from './utils/agentEngine';
import { 
  CheckCircle2, 
  Download, 
  Copy, 
  Eye, 
  Share2, 
  RotateCcw
} from 'lucide-react';

const DEFAULT_CONFIG: AgentConfig = {
  key: '',
  url: '',
  model: '',
  apiFormat: 'openai-compatible',
  cycles: 5,
  fileName: 'app.html',
  rules: 'Tailwind CSS CDN, dark mode, responsive, high quality UI',
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('agent_pro_lang');
      if (saved === 'en' || saved === 'ka') return saved;
    } catch {}
    return 'ka';
  });

  const [config, setConfig] = useState<AgentConfig>(() => {
    try {
      const saved = localStorage.getItem('agent_pro_config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  });

  const [idea, setIdea] = useState(() => {
    try {
      return localStorage.getItem('agent_pro_draft') || '';
    } catch {
      return '';
    }
  });

  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem('agent_pro_last_code') || '';
    } catch {
      return '';
    }
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('logs');
  const [statusText, setStatusText] = useState<string>(() => TRANSLATIONS[lang].logs.ready);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showFinalBanner, setShowFinalBanner] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFixesOpen, setIsFixesOpen] = useState(false);

  // Periodic Auto-save & Crash Recovery States
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string | null>(null);
  const [recoverableBackup, setRecoverableBackup] = useState<AutoSaveBackup | null>(null);
  const [autoSaveToast, setAutoSaveToast] = useState<string | null>(null);

  const stoppedRef = useRef(false);
  const pausedRef = useRef(false);
  const timerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // References to track current state in 60s periodic interval
  const ideaRef = useRef(idea);
  const codeRef = useRef(code);
  const cycleRef = useRef(currentCycle);
  const langRef = useRef(lang);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    langRef.current = lang;
    try {
      localStorage.setItem('agent_pro_lang', lang);
    } catch {}
    if (!isRunning) {
      setStatusText(t.logs.ready);
    }
  }, [lang, t]);

  useEffect(() => {
    ideaRef.current = idea;
  }, [idea]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    cycleRef.current = currentCycle;
  }, [currentCycle]);

  // Check for crash recovery / existing autosave slot on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agent_pro_autosave') || localStorage.getItem('autosave');
      if (saved) {
        const parsed: AutoSaveBackup = JSON.parse(saved);
        if (parsed && (parsed.idea || parsed.code)) {
          const curIdea = localStorage.getItem('agent_pro_draft') || '';
          const curCode = localStorage.getItem('agent_pro_last_code') || '';
          if (
            (parsed.code && parsed.code.trim() !== curCode.trim()) ||
            (parsed.idea && parsed.idea.trim() !== curIdea.trim())
          ) {
            setRecoverableBackup(parsed);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse autosave slot:', e);
    }
  }, []);

  // Periodic Auto-save every 60 seconds into secondary 'autosave' slot in localStorage
  useEffect(() => {
    const doAutoSave = () => {
      const curIdea = ideaRef.current;
      const curCode = codeRef.current;
      const curLang = langRef.current;
      const currentT = TRANSLATIONS[curLang];
      if (curIdea.trim() || curCode.trim()) {
        try {
          const backup: AutoSaveBackup = {
            idea: curIdea,
            code: curCode,
            cycle: cycleRef.current,
            timestamp: new Date().toISOString(),
          };
          const serialized = JSON.stringify(backup);
          localStorage.setItem('agent_pro_autosave', serialized);
          localStorage.setItem('autosave', serialized);
          const timeFormatted = new Date().toLocaleTimeString(curLang === 'ka' ? 'ka-GE' : 'en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastAutoSaveTime(timeFormatted);
          setAutoSaveToast(`${currentT.header.autoSave}: ${timeFormatted}`);
          setTimeout(() => setAutoSaveToast(null), 3000);
        } catch (e) {
          console.warn('Periodic autosave failed:', e);
        }
      }
    };

    const intervalId = setInterval(doAutoSave, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Sync config to localStorage
  const handleSaveConfig = (newConfig: AgentConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('agent_pro_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  };

  // Sync draft idea to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('agent_pro_draft', idea);
    } catch {}
  }, [idea]);

  // Sync code to localStorage
  useEffect(() => {
    if (code) {
      try {
        localStorage.setItem('agent_pro_last_code', code);
      } catch {}
    }
  }, [code]);

  const handleToggleLanguage = () => {
    setLang((prev) => (prev === 'ka' ? 'en' : 'ka'));
  };

  const handleRestoreAutosave = () => {
    const backup = recoverableBackup || (() => {
      try {
        const saved = localStorage.getItem('agent_pro_autosave') || localStorage.getItem('autosave');
        return saved ? JSON.parse(saved) : null;
      } catch { return null; }
    })();

    if (!backup) {
      alert(t.logs.backupEmpty);
      return;
    }
    if (backup.idea) {
      setIdea(backup.idea);
      try { localStorage.setItem('agent_pro_draft', backup.idea); } catch {}
    }
    if (backup.code) {
      setCode(backup.code);
      try { localStorage.setItem('agent_pro_last_code', backup.code); } catch {}
      setShowFinalBanner(true);
    }
    if (backup.cycle !== undefined && backup.cycle > 0) {
      setCurrentCycle(backup.cycle);
    }
    const savedTime = backup.timestamp 
      ? new Date(backup.timestamp).toLocaleTimeString(lang === 'ka' ? 'ka-GE' : 'en-US') 
      : '';
    addLog(t.logs.dataRestored.replace('{time}', savedTime ? `(${savedTime})` : ''), 'success');
    setRecoverableBackup(null);
  };

  const handleDismissAutosave = () => {
    setRecoverableBackup(null);
  };

  const handleManualBackup = () => {
    try {
      const backup: AutoSaveBackup = {
        idea: ideaRef.current,
        code: codeRef.current,
        cycle: cycleRef.current,
        timestamp: new Date().toISOString(),
      };
      const serialized = JSON.stringify(backup);
      localStorage.setItem('agent_pro_autosave', serialized);
      localStorage.setItem('autosave', serialized);
      const timeFormatted = new Date().toLocaleTimeString(lang === 'ka' ? 'ka-GE' : 'en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastAutoSaveTime(timeFormatted);
      setAutoSaveToast(`${t.header.autoSave}: ${timeFormatted}`);
      setTimeout(() => setAutoSaveToast(null), 3000);
      addLog(t.logs.backupCreated.replace('{time}', timeFormatted), 'info');
      return true;
    } catch {
      return false;
    }
  };

  // Timer controls
  const startTimer = () => {
    setTimerSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current && !stoppedRef.current) {
        setTimerSeconds((s) => s + 1);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const addLog = (
    text: string,
    type: LogEntry['type'] = 'info'
  ) => {
    const time = new Date().toLocaleTimeString(langRef.current === 'ka' ? 'ka-GE' : 'en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setLogs((prev) => {
      const updated = [...prev, { id: Math.random().toString(), time, text, type }];
      return updated.length > 800 ? updated.slice(-600) : updated;
    });
    setRawText((prev) => {
      const appended = prev + `[${time}] ${text}\n`;
      return appended.length > 500000 ? appended.slice(-300000) : appended;
    });
  };

  // Sandbox testing in invisible iframe
  const runSandboxTest = (htmlContent: string): Promise<{ ok: boolean; msg: string | null }> => {
    return new Promise((resolve) => {
      const ifr = document.createElement('iframe');
      ifr.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
      ifr.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:100px;height:100px;border:0;opacity:0';
      document.body.appendChild(ifr);

      let err: string | null = null;
      let done = false;
      let loadGraceTimer: any = null;

      const finish = (ok: boolean, msg: string | null) => {
        if (done) return;
        done = true;
        clearTimeout(maxTimer);
        if (loadGraceTimer) clearTimeout(loadGraceTimer);
        window.removeEventListener('message', handler);
        if (ifr.parentNode) ifr.parentNode.removeChild(ifr);
        resolve({ ok, msg });
      };

      const handler = (e: MessageEvent) => {
        if (e.source === ifr.contentWindow && e.data && e.data.type === 'sb_err') {
          err = e.data.msg;
          finish(false, err);
        }
      };

      window.addEventListener('message', handler);

      const maxTimer = setTimeout(() => {
        if (err) finish(false, err);
        else finish(true, null);
      }, 2500);

      ifr.onload = () => {
        loadGraceTimer = setTimeout(() => {
          if (err) finish(false, err);
          else finish(true, null);
        }, 350);
      };

      const injection = `
        <script>
          window.onerror = function(m, u, l) {
            var t = typeof m === 'object' && m ? m.message || String(m) : String(m);
            try { parent.postMessage({ type: 'sb_err', msg: t + ' (line ' + (l || '?') + ')' }, '*'); } catch(e){}
          };
          window.addEventListener('unhandledrejection', function(e) {
            var r = e.reason && e.reason.message ? e.reason.message : String(e.reason);
            try { parent.postMessage({ type: 'sb_err', msg: 'Promise: ' + r }, '*'); } catch(ex){}
          });
        </script>
      `;

      try {
        let finalHtml = htmlContent;
        if (/<head[^>]*>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/(<head[^>]*>)/i, '$1' + injection);
        } else if (/<body[^>]*>/i.test(finalHtml)) {
          finalHtml = finalHtml.replace(/(<body[^>]*>)/i, '$1' + injection);
        } else {
          finalHtml = injection + finalHtml;
        }
        ifr.srcdoc = finalHtml;
      } catch (e: any) {
        finish(false, e?.message || 'Iframe load error');
      }
    });
  };

  const waitIfPaused = async () => {
    while (pausedRef.current && !stoppedRef.current) {
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  // Main Loop
  const handleStart = async () => {
    const trimmedIdea = idea.trim();
    if (!trimmedIdea) {
      alert(t.logs.enterIdeaPrompt);
      return;
    }

    const { effectiveUrl, effectiveModel, provider } = resolveEffectiveConfig(config);

    if (!effectiveUrl) {
      alert(t.logs.enterUrlPrompt);
      setIsSettingsOpen(true);
      return;
    }

    if (!effectiveModel) {
      alert(t.logs.enterModelPrompt);
      setIsSettingsOpen(true);
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setShowFinalBanner(false);
    stoppedRef.current = false;
    pausedRef.current = false;
    setCurrentCycle(0);
    abortControllerRef.current = new AbortController();

    const isUnlimited = config.cycles === 0;
    const cycleTargetText = isUnlimited 
      ? t.logs.unlimitedCycles 
      : t.logs.maxCycles.replace('{count}', String(config.cycles));
    const providerInfo = provider 
      ? ` | ${t.logs.providerLabel}: ${provider.name}${provider.requiresUrl ? '' : ` (${t.logs.automaticUrlLabel})`}` 
      : '';

    setRawText(`[Agent Pro — Lasha Kvitsiani's Production]\nIdea: ${trimmedIdea}\nMode: ${cycleTargetText}${providerInfo}\nModel: ${effectiveModel}\n────────────────────────────────────────\n`);
    setLogs([]);
    startTimer();

    let generatedCode = '';
    let feedback = '';
    let cycle = 0;
    let finished = false;

    addLog(
      t.logs.processStarted
        .replace('{cycles}', cycleTargetText)
        .replace('{provider}', provider ? ` [${provider.name}]` : ''),
      'info'
    );

    try {
      while ((isUnlimited || cycle < config.cycles) && !finished && !stoppedRef.current) {
        await waitIfPaused();
        if (stoppedRef.current) break;

        cycle++;
        setCurrentCycle(cycle);
        setStatusText(
          t.logs.generatingCode
            .replace('{cycle}', String(cycle))
            .replace('{max}', isUnlimited ? '∞' : String(config.cycles))
        );
        addLog(t.logs.requestingAi.replace('{cycle}', String(cycle)), 'cycle');

        const auditPromptNote = feedback
          ? `CRITICAL — fix these issues from previous audit:\n"${feedback}"`
          : 'First version — produce the best possible single-file implementation.';

        const prevSnippet = generatedCode ? truncate(generatedCode, 6000) : '';

        const prompt = `You are an expert single-file web developer (Agent Pro — Lasha Kvitsiani's Production).
Write a complete, high-quality, self-contained HTML file with ALL CSS in <style> and ALL JS in <script>.
Requirements:
- User idea: "${trimmedIdea}"
- ${auditPromptNote}
- Additional rules: "${config.rules || 'none'}"
${prevSnippet ? `- Previous version to improve:\n\`\`\`html\n${prevSnippet}\n\`\`\`\n` : ''}
Output ONLY the complete HTML file, wrapped in \`\`\`\`html ... \`\`\`\` (FOUR backticks). No conversational preamble or postscript.`;

        const rawAiResponse = await callAI(
          prompt, 
          config, 
          3, 
          2500, 
          abortControllerRef.current?.signal
        );

        if (stoppedRef.current) break;

        const extracted = extractCode(rawAiResponse);

        if (!extracted || extracted.length < 40) {
          feedback = 'AI returned empty or invalid code block. Regenerate complete HTML.';
          addLog(t.logs.emptyCodeRetry.replace('{cycle}', String(cycle)), 'warn');
          continue;
        }

        generatedCode = extracted;
        setCode(generatedCode);
        addLog(
          t.logs.codeGenerated
            .replace('{cycle}', String(cycle))
            .replace('{size}', formatSize(codeSize(generatedCode))),
          'success'
        );

        await waitIfPaused();
        if (stoppedRef.current) break;

        // Sandbox check
        setStatusText(t.logs.sandboxTesting);
        addLog(t.logs.sandboxRunning.replace('{cycle}', String(cycle)), 'info');
        const sb = await runSandboxTest(generatedCode);

        if (stoppedRef.current) break;

        const sbMsg = sb.ok ? '' : `Runtime Error: ${sb.msg || 'unknown'}`;
        if (!sb.ok) {
          addLog(t.logs.runtimeErrorFound.replace('{msg}', sb.msg || 'unknown'), 'warn');
        } else {
          addLog(t.logs.runtimeClean, 'success');
        }

        // Auditor check
        setStatusText(t.logs.codeAudit);
        addLog(t.logs.auditorChecking.replace('{cycle}', String(cycle)), 'audit');

        const auditPrompt = `You are a strict code auditor for Agent Pro.
Evaluate this single-file HTML app:
1. Valid HTML structure (DOCTYPE, html, head, body)
2. No runtime JS errors (sandbox reported: "${sbMsg || 'none'}")
3. All CSS/JS is inline (no broken external refs unless CDN)
4. The app actually implements: "${trimmedIdea}"

Output your verdict on the very first line:
VERDICT: OK (if fully functional, complete, styled, and working)
OR
VERDICT: NEEDS_FIXES (followed by specific concise bullet points of what to fix)

Code:
${truncate(generatedCode, 8000)}`;

        const auditResponse = await callAI(
          auditPrompt, 
          config, 
          3, 
          2500, 
          abortControllerRef.current?.signal
        );

        if (stoppedRef.current) break;

        const auditResult = evaluateAuditVerdict(auditResponse, sb.ok);

        if (auditResult.isApproved) {
          finished = true;
          setStatusText(t.logs.appReady);
          addLog(t.logs.auditPassed.replace('{cycle}', String(cycle)), 'success');
          setShowFinalBanner(true);
          setViewMode('preview');
        } else {
          feedback = auditResult.feedback || 'Unknown audit failure';
          addLog(t.logs.auditIssues.replace('{feedback}', feedback), 'warn');
        }
      }

      if (!finished && !stoppedRef.current) {
        setStatusText(t.logs.cyclesDone);
        addLog(t.logs.cyclesExhausted, 'info');
        setShowFinalBanner(true);
      }
    } catch (err: any) {
      if (stoppedRef.current) {
        setStatusText(t.logs.stopped);
        addLog(t.logs.processStoppedByUser, 'warn');
      } else {
        const msg = err?.message || 'Error occurred';
        setStatusText(`❌ ${msg}`);
        addLog(`[Error] ${msg}`, 'error');
        if (msg.includes('Endpoint') || msg.includes('Model') || msg.includes('API')) {
          setIsSettingsOpen(true);
        }
      }
    } finally {
      setIsRunning(false);
      setIsPaused(false);
      stopTimer();
    }
  };

  const handlePause = () => {
    pausedRef.current = true;
    setIsPaused(true);
    setStatusText(t.logs.paused);
    addLog(t.logs.paused, 'warn');
  };

  const handleResume = () => {
    pausedRef.current = false;
    setIsPaused(false);
    setStatusText(t.logs.resumed);
    addLog(t.logs.resumed, 'info');
  };

  const handleStop = () => {
    stoppedRef.current = true;
    pausedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setIsPaused(false);
    stopTimer();
    setStatusText(t.logs.stopped);
    addLog(t.logs.processStoppedByUser, 'warn');
  };

  const handleDownloadApp = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFileName(config.fileName || 'app.html');
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    addLog(t.logs.fileDownloaded.replace('{file}', config.fileName || 'app.html'), 'info');
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    addLog(t.logs.codeCopiedToClipboard, 'info');
  };

  const handleClear = () => {
    setCode('');
    setLogs([]);
    setRawText(`Agent Pro — Lasha Kvitsiani's Production\n${t.logs.logsCleared}\n`);
    setShowFinalBanner(false);
    setStatusText(t.logs.ready);
    setCurrentCycle(0);
    setTimerSeconds(0);
    try {
      localStorage.removeItem('agent_pro_last_code');
    } catch {}
  };

  const handleDownloadFixedHtml = () => {
    const a = document.createElement('a');
    a.href = '/agent-pro.html';
    a.download = 'agent-pro.html';
    a.click();
    addLog(t.logs.fileDownloaded.replace('{file}', 'agent-pro.html'), 'success');
  };

  const handleShare = () => {
    if (!code) return;
    if (navigator.share) {
      navigator.share({
        title: 'Agent Pro App',
        text: `Created with Agent Pro (Lasha Kvitsiani\'s Production)!\nIdea: ${idea}`,
      }).catch(() => {});
    } else {
      handleCopyCode();
      alert(t.banners.sharedSuccess);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Header with Language Switcher */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        hasCode={!!code}
        onDownload={handleDownloadApp}
        onCopy={handleCopyCode}
        onClear={handleClear}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFixes={() => setIsFixesOpen(true)}
        onDownloadFixedHtml={handleDownloadFixedHtml}
        isCopied={isCopied}
        lastAutoSaveTime={lastAutoSaveTime}
        onManualBackup={handleManualBackup}
        hasRecoverableBackup={!!recoverableBackup}
        onRestoreBackup={handleRestoreAutosave}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Crash Recovery Auto-Save Banner */}
      {recoverableBackup && (
        <div className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">
              {t.banners.autosaveDetected.replace(
                '{time}',
                new Date(recoverableBackup.timestamp).toLocaleTimeString(lang === 'ka' ? 'ka-GE' : 'en-US')
              )}
              {recoverableBackup.code
                ? ` • ${t.banners.codeSize.replace('{size}', `${Math.round(recoverableBackup.code.length / 1024)} KB`)}`
                : ''}
              {recoverableBackup.idea
                ? ` • ${t.banners.ideaSnippet.replace('{idea}', recoverableBackup.idea.slice(0, 35) + '...')}`
                : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreAutosave}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm transition-all"
            >
              <span>{t.banners.restoreAction}</span>
            </button>
            <button
              onClick={handleDismissAutosave}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition-all"
            >
              {t.banners.dismissAction}
            </button>
          </div>
        </div>
      )}

      {/* Final Completion Banner */}
      {showFinalBanner && (
        <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border-b border-blue-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 text-blue-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">
              {t.banners.completedTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('preview')}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.banners.previewAction}</span>
            </button>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t.banners.copyCodeAction}</span>
            </button>
            <button
              onClick={handleDownloadApp}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-medium shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.banners.downloadAction}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              title={t.banners.shareTitle}
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
        {viewMode === 'logs' && <ConsoleView logs={logs} rawText={rawText} lang={lang} />}
        {viewMode === 'preview' && <PreviewStage code={code} lang={lang} />}
        {viewMode === 'code' && (
          <CodeView
            code={code}
            fileName={config.fileName || 'app.html'}
            onDownload={handleDownloadApp}
            lang={lang}
          />
        )}
      </main>

      {/* Prompt Bar & Controls */}
      <PromptBar
        idea={idea}
        setIdea={setIdea}
        isRunning={isRunning}
        isPaused={isPaused}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        statusText={statusText}
        timerSeconds={timerSeconds}
        currentCycle={currentCycle}
        maxCycles={config.cycles}
        code={code}
        lang={lang}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        lastAutoSaveTime={lastAutoSaveTime}
        onManualBackup={handleManualBackup}
        onRestoreBackup={handleRestoreAutosave}
        lang={lang}
        setLang={setLang}
      />

      {/* Fixes Report Modal */}
      <FixesModal
        isOpen={isFixesOpen}
        onClose={() => setIsFixesOpen(false)}
        onDownloadFixedHtml={handleDownloadFixedHtml}
        lang={lang}
      />

      {/* Auto-Save Toast Alert */}
      {autoSaveToast && (
        <div className="fixed bottom-24 right-4 z-50 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur flex items-center gap-2 pointer-events-none transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{autoSaveToast}</span>
        </div>
      )}
    </div>
  );
}
