import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Globe, 
  Cpu, 
  Hash, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Download, 
  Eye, 
  EyeOff, 
  Infinity, 
  Sparkles,
  Languages
} from 'lucide-react';
import { AgentConfig, ApiFormat, Language } from '../types';
import { testApiConnection, sanitizeFileName, detectProvider, resolveEffectiveConfig } from '../utils/agentEngine';
import { TRANSLATIONS } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AgentConfig;
  onSave: (newConfig: AgentConfig) => void;
  lastAutoSaveTime?: string | null;
  onManualBackup?: () => void;
  onRestoreBackup?: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  lastAutoSaveTime,
  onManualBackup,
  onRestoreBackup,
  lang,
  setLang,
}) => {
  const [formData, setFormData] = useState<AgentConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(formData.cycles === 0);

  const t = TRANSLATIONS[lang].settings;

  // Active detected provider based on key, model, or url
  const detected = detectProvider(formData.key, formData.model, formData.url);

  // If Gemini key or model is entered and format is default, auto-adjust to google-format
  useEffect(() => {
    if (detected?.id === 'gemini' && formData.apiFormat === 'openai-compatible' && !formData.url) {
      setFormData((prev) => ({ ...prev, apiFormat: 'google-format' }));
    }
  }, [detected?.id, formData.url, formData.apiFormat]);

  if (!isOpen) return null;

  const handleTestApi = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testApiConnection(formData);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ ok: false, message: e?.message || 'Error testing connection' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const parsedCycles = isUnlimited ? 0 : Math.max(1, Number(formData.cycles) || 1);
    const { effectiveModel, effectiveFormat } = resolveEffectiveConfig(formData);

    const cleanConfig: AgentConfig = {
      ...formData,
      model: formData.model.trim() || effectiveModel,
      apiFormat: formData.apiFormat || effectiveFormat,
      fileName: sanitizeFileName(formData.fileName),
      cycles: parsedCycles,
    };
    onSave(cleanConfig);
    onClose();
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `agent-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
          }));
          setIsUnlimited(parsed.cycles === 0);
          alert(t.importSuccess);
        }
      } catch {
        alert(t.importFail);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 flex flex-col gap-4 text-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/40 shadow-sm shadow-cyan-500/20 shrink-0 bg-slate-950">
              <img src="/icon.png" alt="Icon" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {t.title}
              </h2>
              <p className="text-[11px] text-slate-400">
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

        {/* Language Switcher Bar inside Settings */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{t.language}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLang('ka')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                lang === 'ka'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🇬🇪 ქართული
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>

        {/* Auto-Detected Provider Banner */}
        {detected && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-950/50 border border-blue-500/40 text-blue-200 text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">{detected.name}</span>
                <span className="text-[11px] text-slate-300 ml-1.5 block sm:inline">
                  {detected.requiresUrl
                    ? t.requiresUrl
                    : t.noUrlNeeded}
                </span>
              </div>
            </div>
            {!formData.url && !detected.requiresUrl && (
              <span className="hidden sm:inline-block text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                {t.urlAutomatic}
              </span>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-3 text-xs">
          {/* API Key (Placed First for instant provider auto-detection) */}
          <div>
            <label className="flex items-center justify-between font-medium text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.apiKeyLabel}</span>
              </span>
              {detected && (
                <span className="text-[10px] text-emerald-400 font-mono">
                  {t.recognized} {detected.name}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 pr-9 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {t.apiKeyHint}
            </span>
          </div>

          {/* Model Identifier & Quick Chips */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.modelLabel}</span>
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder={detected?.defaultModel || t.modelPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* API Format */}
              <div>
                <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
                  <span>{t.protocolFormatLabel}</span>
                </label>
                <select
                  value={formData.apiFormat}
                  onChange={(e) => setFormData({ ...formData, apiFormat: e.target.value as ApiFormat })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="google-format">Google Format API (Gemini)</option>
                  <option value="openai-compatible">Standard (OpenAI-Compatible)</option>
                  <option value="direct-endpoint">Direct URL (as-is)</option>
                </select>
              </div>
            </div>

            {/* Quick Model Selection Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">{t.quickSelect}</span>
              {(detected?.id === 'gemini' || !detected || detected.id === 'custom') && (
                <>
                  {['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, model: m, apiFormat: 'google-format' })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                        formData.model === m
                          ? 'bg-blue-600 border-blue-400 text-white font-medium'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </>
              )}
              {detected?.id === 'openai' && (
                <>
                  {['gpt-4o', 'gpt-4o-mini', 'o3-mini'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, model: m, apiFormat: 'openai-compatible' })}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                        formData.model === m
                          ? 'bg-blue-600 border-blue-400 text-white font-medium'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </>
              )}
              {detected?.id === 'groq' && (
                <>
                  {['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, model: m, apiFormat: 'openai-compatible' })}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                    >
                      {m}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* API Endpoint URL (Optional for Gemini / standard AI) */}
          <div>
            <label className="flex items-center justify-between font-medium text-slate-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.endpointUrlLabel}</span>
              </span>
              {detected && !detected.requiresUrl && (
                <span className="text-[10px] text-emerald-400">
                  {t.optionalForProvider.replace('{name}', detected.name)}
                </span>
              )}
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={
                detected && !detected.requiresUrl
                  ? t.endpointUrlPlaceholderAuto.replace('{defaultUrl}', detected.defaultUrl)
                  : t.endpointUrlPlaceholderCustom
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
            />
            {detected && !detected.requiresUrl && !formData.url && (
              <span className="text-[10px] text-slate-500 block mt-1">
                {t.endpointUrlEmptyNote} <code className="text-slate-400">{detected.defaultUrl}</code>
              </span>
            )}
          </div>

          {/* Cycles (Unlimited support with NO MAX CAP) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1.5 font-medium text-slate-300">
                  <Hash className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.cycleCountLabel}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsUnlimited(!isUnlimited)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                    isUnlimited
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Infinity className="w-3 h-3" />
                  <span>{t.unlimitedToggle}</span>
                </button>
              </div>

              {isUnlimited ? (
                <div className="w-full bg-blue-950/40 border border-blue-800/40 rounded-md px-3 py-2 text-blue-300 text-xs flex items-center gap-1.5">
                  <Infinity className="w-3.5 h-3.5" />
                  <span>{t.unlimitedActive}</span>
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={formData.cycles}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFormData({ ...formData, cycles: isNaN(val) ? 1 : Math.max(1, val) });
                  }}
                  placeholder={t.cycleCountPlaceholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              )}
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {t.cycleCountHint}
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-medium text-slate-300 mb-1">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.fileNameLabel}</span>
              </label>
              <input
                type="text"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                placeholder="app.html"
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Custom Rules */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              {t.customRulesLabel}
            </label>
            <textarea
              rows={2}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder={t.customRulesPlaceholder}
              className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Advanced: Custom Headers (JSON) */}
          <div className="border border-slate-800 rounded-lg p-2.5 bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200"
            >
              <span className="font-medium flex items-center gap-1.5">
                <span>{t.advancedHeadersLabel}</span>
              </span>
              <span className="text-[10px] text-blue-400">{showAdvanced ? t.collapse : t.expand}</span>
            </button>
            {showAdvanced && (
              <div className="mt-2 space-y-1">
                <textarea
                  rows={2}
                  value={formData.customHeaders || ''}
                  onChange={(e) => setFormData({ ...formData, customHeaders: e.target.value })}
                  placeholder='{"HTTP-Referer": "https://example.com", "X-Title": "Agent Pro"}'
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-100 text-[11px] focus:outline-none focus:border-blue-500 font-mono resize-none"
                />
                <span className="text-[10px] text-slate-500 block">
                  {t.customHeadersHint}
                </span>
              </div>
            )}
          </div>

          {/* Data Protection: Auto-Save Slot (60s) */}
          <div className="border border-slate-800 rounded-lg p-2.5 bg-slate-950/60 flex items-center justify-between gap-2">
            <div className="text-xs">
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{t.autoSaveSlotLabel}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {lastAutoSaveTime ? `${t.lastAutoSave}${lastAutoSaveTime}` : t.autoSaveSlotHint}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onManualBackup && (
                <button
                  type="button"
                  onClick={onManualBackup}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition"
                  title={t.backupNow}
                >
                  {t.backupNow}
                </button>
              )}
              {onRestoreBackup && (
                <button
                  type="button"
                  onClick={() => {
                    onRestoreBackup();
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40 text-[11px] font-medium transition"
                  title={t.restore}
                >
                  {t.restore}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-2.5 rounded-md text-xs flex items-start gap-2 ${
              testResult.ok
                ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-700/50 text-rose-300'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <div className="break-words">{testResult.message}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTestApi}
              disabled={testing}
              className="flex-1 py-2 px-3 rounded-md text-xs font-medium bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{testing ? t.testing : t.testApi}</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 px-3 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/30"
            >
              {t.saveAndClose}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 py-1.5 px-2 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>{t.exportSettings}</span>
            </button>
            <label className="flex-1 py-1.5 px-2 rounded-md text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center justify-center gap-1 cursor-pointer">
              <Upload className="w-3 h-3" />
              <span>{t.importSettings}</span>
              <input type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
