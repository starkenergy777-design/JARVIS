import { AgentConfig, ApiFormat } from '../types';

export const WIN_RE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function sanitizeFileName(n: string): string {
  let clean = String(n || '')
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .trim();
  if (!clean || WIN_RE.test(clean)) clean = 'app';
  if (!/\.html$/i.test(clean)) clean += '.html';
  return clean;
}

export function formatSize(bytes: number): string {
  if (!bytes || bytes < 0 || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function codeSize(s: string): number {
  try {
    return new TextEncoder().encode(s || '').length;
  } catch {
    return (s || '').length;
  }
}

export function truncate(s: string, max: number): string {
  if (!s || max <= 0) return '';
  if (s.length <= max) return s;
  return s.slice(0, max) + '\n\n[... truncated ' + formatSize(codeSize(s.slice(max))) + ' ...]';
}

/**
 * Bulletproof Code Extraction
 * Extracts valid HTML from code fences, partial fences, or tag boundaries.
 */
export function extractCode(raw: string): string {
  if (!raw) return '';
  const t = String(raw).trim();

  // 1. Try 4-backtick fence: ````html ... ````
  const re4 = /(`{4,})[ \t]*(?:html|htm)?\s*[\r\n]+([\s\S]*?)[\r\n]+\s*\1/i;
  const m4 = re4.exec(t);
  if (m4 && m4[2] && m4[2].trim().length > 30) {
    return m4[2].trim();
  }

  // 2. Try standard 3-backtick fence: ```html ... ```
  const re3 = /(`{3})[ \t]*(?:html|htm)?\s*[\r\n]+([\s\S]*?)[\r\n]+\s*\1/i;
  const m3 = re3.exec(t);
  if (m3 && m3[2] && m3[2].trim().length > 30) {
    return m3[2].trim();
  }

  // 3. Handle unclosed fence (if token limit cut off generation before closing backticks)
  const unclosed = t.match(/`{3,}[ \t]*(?:html|htm)?\s*[\r\n]+([\s\S]+)$/i);
  if (unclosed && unclosed[1] && unclosed[1].trim().length > 30) {
    return unclosed[1].trim();
  }

  // 4. Complete HTML tag match (DOCTYPE or html to </html>)
  const docMatch = t.match(/<!DOCTYPE\s+html[\s\S]*?<\/html>/i) || t.match(/<html[\s\S]*?<\/html>/i);
  if (docMatch && docMatch[0] && docMatch[0].length > 30) {
    return docMatch[0].trim();
  }

  // 5. From first <!DOCTYPE or <html to end of string
  const docStart = t.search(/<!DOCTYPE\s+html|<html[\s>]/i);
  if (docStart !== -1) {
    const partial = t.slice(docStart);
    if (partial.length > 30) return partial.trim();
  }

  return t;
}

/**
 * Detected AI Provider information
 */
export interface DetectedProvider {
  id: 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'deepseek' | 'mistral' | 'xai' | 'perplexity' | 'custom';
  name: string;
  defaultUrl: string;
  defaultFormat: ApiFormat;
  defaultModel?: string;
  requiresUrl: boolean;
  description: string;
}

/**
 * Automatically detects the AI provider from the API key, model, or custom URL.
 * Recognizes Google Gemini, OpenAI, Groq, OpenRouter, Anthropic, DeepSeek, Mistral, xAI, etc.
 */
export function detectProvider(key = '', model = '', url = ''): DetectedProvider | null {
  const k = (key || '').trim();
  const m = (model || '').trim().toLowerCase();
  const u = (url || '').trim().toLowerCase();

  // 1. Google Gemini (by Key: AIzaSy..., or Model: gemini..., or URL: googleapis.com)
  if (
    k.startsWith('AIzaSy') ||
    m.includes('gemini') ||
    u.includes('googleapis.com') ||
    u.includes('generativelanguage')
  ) {
    return {
      id: 'gemini',
      name: 'Google Gemini',
      defaultUrl: 'https://generativelanguage.googleapis.com/v1beta',
      defaultFormat: 'google-format',
      defaultModel: 'gemini-2.5-flash',
      requiresUrl: false,
      description: 'Google Generative Language API (URL არ არის საჭირო, ავტომატურია)',
    };
  }

  // 2. Groq (by Key: gsk_..., or Model/URL: groq)
  if (k.startsWith('gsk_') || m.includes('groq') || u.includes('groq.com')) {
    return {
      id: 'groq',
      name: 'Groq',
      defaultUrl: 'https://api.groq.com/openai/v1',
      defaultFormat: 'openai-compatible',
      defaultModel: 'llama-3.3-70b-versatile',
      requiresUrl: false,
      description: 'Groq Ultra-Fast Inference (URL ავტომატურია)',
    };
  }

  // 3. OpenRouter (by Key: sk-or-v1-..., or model containing slash like 'anthropic/claude-3.5-sonnet', or openrouter.ai)
  if (k.startsWith('sk-or-v1-') || (m.includes('/') && !u) || u.includes('openrouter.ai')) {
    return {
      id: 'openrouter',
      name: 'OpenRouter',
      defaultUrl: 'https://openrouter.ai/api/v1',
      defaultFormat: 'openai-compatible',
      defaultModel: 'google/gemini-2.5-flash',
      requiresUrl: false,
      description: 'OpenRouter Unified API (URL ავტომატურია)',
    };
  }

  // 4. Anthropic Claude (by Key: sk-ant-..., or Model: claude..., or anthropic.com)
  if (k.startsWith('sk-ant-') || m.includes('claude') || u.includes('anthropic.com')) {
    return {
      id: 'anthropic',
      name: 'Anthropic Claude',
      defaultUrl: 'https://api.anthropic.com/v1',
      defaultFormat: 'openai-compatible',
      defaultModel: 'claude-3-5-sonnet-20241022',
      requiresUrl: false,
      description: 'Anthropic Claude API (URL ავტომატურია)',
    };
  }

  // 5. DeepSeek (by Model: deepseek... or deepseek.com)
  if (m.includes('deepseek') || u.includes('deepseek.com')) {
    return {
      id: 'deepseek',
      name: 'DeepSeek',
      defaultUrl: 'https://api.deepseek.com',
      defaultFormat: 'openai-compatible',
      defaultModel: 'deepseek-chat',
      requiresUrl: false,
      description: 'DeepSeek Official API (URL ავტომატურია)',
    };
  }

  // 6. xAI (Grok) (by Key: xai-..., or Model: grok..., or x.ai)
  if (k.startsWith('xai-') || m.includes('grok') || u.includes('x.ai')) {
    return {
      id: 'xai',
      name: 'xAI (Grok)',
      defaultUrl: 'https://api.x.ai/v1',
      defaultFormat: 'openai-compatible',
      defaultModel: 'grok-2-latest',
      requiresUrl: false,
      description: 'xAI Official API (URL ავტომატურია)',
    };
  }

  // 7. Perplexity (by Key: pplx-..., or Model: sonar..., or perplexity.ai)
  if (k.startsWith('pplx-') || m.includes('sonar') || u.includes('perplexity.ai')) {
    return {
      id: 'perplexity',
      name: 'Perplexity',
      defaultUrl: 'https://api.perplexity.ai',
      defaultFormat: 'openai-compatible',
      defaultModel: 'sonar',
      requiresUrl: false,
      description: 'Perplexity AI API (URL ავტომატურია)',
    };
  }

  // 8. Mistral (by Key: mistral_... or Model: mistral/codestral)
  if (k.startsWith('mistral_') || m.includes('mistral') || m.includes('codestral') || u.includes('mistral.ai')) {
    return {
      id: 'mistral',
      name: 'Mistral AI',
      defaultUrl: 'https://api.mistral.ai/v1',
      defaultFormat: 'openai-compatible',
      defaultModel: 'mistral-large-latest',
      requiresUrl: false,
      description: 'Mistral AI API (URL ავტომატურია)',
    };
  }

  // 9. OpenAI (by Key: sk-proj-... or sk-... or Model: gpt-*, o1-*, o3-*, o4-*, chatgpt)
  if (
    k.startsWith('sk-proj-') ||
    k.startsWith('sk-') ||
    m.includes('gpt') ||
    m.startsWith('o1') ||
    m.startsWith('o3') ||
    m.startsWith('o4') ||
    u.includes('api.openai.com')
  ) {
    return {
      id: 'openai',
      name: 'OpenAI',
      defaultUrl: 'https://api.openai.com/v1',
      defaultFormat: 'openai-compatible',
      defaultModel: 'gpt-4o',
      requiresUrl: false,
      description: 'OpenAI API (URL ავტომატურია)',
    };
  }

  // 10. Custom Endpoint URL manually specified
  if (url && url.trim()) {
    return {
      id: 'custom',
      name: 'Custom Endpoint',
      defaultUrl: url.trim(),
      defaultFormat: 'openai-compatible',
      requiresUrl: true,
      description: 'საკუთარი API სერვერი / Reverse Proxy',
    };
  }

  return null;
}

/**
 * Resolves the effective configuration for an agent call,
 * automatically supplying default URLs, formats, and models when recognized
 * without requiring the user to type a URL for Gemini or other standard providers.
 */
export function resolveEffectiveConfig(config: AgentConfig): {
  effectiveUrl: string;
  effectiveFormat: ApiFormat;
  effectiveModel: string;
  provider: DetectedProvider | null;
} {
  const provider = detectProvider(config.key, config.model, config.url);
  const cleanUrl = (config.url || '').trim().replace(/\/+$/, '');

  let effectiveUrl = cleanUrl;
  let effectiveFormat = config.apiFormat;
  let effectiveModel = (config.model || '').trim();

  if (provider) {
    // If URL is empty, use the provider's default URL automatically
    if (!effectiveUrl) {
      effectiveUrl = provider.defaultUrl;
    }
    // For Gemini, automatically use Google format if not direct-endpoint
    if (provider.id === 'gemini' && effectiveFormat !== 'direct-endpoint') {
      effectiveFormat = 'google-format';
    }
    // If model is empty, use provider's recommended default model
    if (!effectiveModel && provider.defaultModel) {
      effectiveModel = provider.defaultModel;
    }
  }

  return { effectiveUrl, effectiveFormat, effectiveModel, provider };
}

/**
 * Neutral Endpoint Builder
 * Constructs request parameters based purely on user specifications without hardcoded provider bias.
 * Automatically resolves endpoint URL for Gemini and known providers when URL is not explicitly entered.
 */
export function buildApiRequest(config: AgentConfig, prompt: string) {
  const { effectiveUrl, effectiveFormat, effectiveModel, provider } = resolveEffectiveConfig(config);
  const k = (config.key || '').trim();
  const m = effectiveModel;
  let cleanUrl = effectiveUrl;

  let endpoint = cleanUrl;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if key provided
  if (k) {
    headers['Authorization'] = `Bearer ${k}`;
  }

  // Apply optional custom headers
  if (config.customHeaders && config.customHeaders.trim()) {
    try {
      const parsed = JSON.parse(config.customHeaders);
      if (typeof parsed === 'object' && parsed !== null) {
        headers = { ...headers, ...parsed };
      }
    } catch {
      // Ignore invalid JSON in custom headers
    }
  }

  let body: Record<string, unknown>;

  const isGemini =
    effectiveFormat === 'google-format' ||
    cleanUrl.includes('googleapis.com') ||
    provider?.id === 'gemini';

  if (isGemini) {
    const cleanModel = (m || 'gemini-2.5-flash').replace(/^models\//, '');
    const base = cleanUrl || 'https://generativelanguage.googleapis.com/v1beta';
    endpoint = `${base}/models/${encodeURIComponent(cleanModel)}:generateContent`;
    if (k && !endpoint.includes('key=')) {
      endpoint += `?key=${encodeURIComponent(k)}`;
      delete headers['Authorization'];
    }
    body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
    };
  } else {
    // Standard OpenAI-compatible API format (industry standard supported by most inference engines)
    if (endpoint && !endpoint.endsWith('/chat/completions') && effectiveFormat !== 'direct-endpoint') {
      endpoint = `${endpoint}/chat/completions`;
    }
    body = {
      model: m,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    };
  }

  return { endpoint, headers, body, effectiveModel, provider };
}

/**
 * Neutral API Connection Tester
 * Seamlessly tests connection even when URL is omitted for recognized providers like Gemini.
 */
export async function testApiConnection(config: AgentConfig, signal?: AbortSignal): Promise<{ ok: boolean; message: string }> {
  const { endpoint, headers, body, effectiveModel, provider } = buildApiRequest(config, 'Respond with: PONG');

  if (!endpoint) {
    return {
      ok: false,
      message: 'მიუთითეთ API Endpoint URL ან შეიყვანეთ API Key/მოდელი (მაგ. Gemini-სთვის URL ავტომატურია).',
    };
  }
  if (!effectiveModel) {
    return { ok: false, message: 'მიუთითეთ მოდელის სახელი (Model Identifier)' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });

    const raw = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(raw);
    } catch {
      // Non-JSON response
    }

    if (!res.ok) {
      let errMsg = `Status ${res.status}`;
      if (data && data.error) {
        errMsg = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
      } else if (raw) {
        errMsg = raw.slice(0, 180);
      }
      return { ok: false, message: errMsg };
    }

    let reply = '';
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    } else if (data?.text) {
      reply = data.text;
    }

    const providerTag = provider ? `[${provider.name}] ` : '';

    return {
      ok: true,
      message: `✅ ${providerTag}API კავშირი წარმატებით დამყარდა! პასუხი: "${(reply || 'PONG').trim()}"`,
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { ok: false, message: 'ტესტირება გაუქმდა.' };
    }
    return { ok: false, message: err?.message || 'ქსელური შეცდომა (Network Error)' };
  }
}

/**
 * Neutral AI Completion Caller with AbortSignal and retry logic
 */
export async function callAI(
  prompt: string,
  config: AgentConfig,
  retries = 3,
  delay = 2500,
  signal?: AbortSignal
): Promise<string> {
  const { endpoint, headers, body, effectiveModel } = buildApiRequest(config, prompt);

  if (!endpoint) {
    throw new Error('API Endpoint URL არ არის მითითებული და პროვაიდერის ავტომატური ამოცნობა ვერ მოხერხდა.');
  }
  if (!effectiveModel) {
    throw new Error('მოდელის სახელი (Model Identifier) არ არის მითითებული.');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    if (signal?.aborted) {
      throw new Error('პროცესი შეჩერებულია მომხმარებლის მიერ.');
    }

    let isTimedOut = false;

    try {
      // Create a combined timeout controller unless external signal aborts
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        timeoutController.abort();
      }, 120000);

      const onExternalAbort = () => {
        timeoutController.abort();
      };

      if (signal) {
        signal.addEventListener('abort', onExternalAbort, { once: true });
      }

      let res: Response;
      try {
        res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: timeoutController.signal,
        });
      } finally {
        clearTimeout(timeoutId);
        if (signal) {
          signal.removeEventListener('abort', onExternalAbort);
        }
      }

      if (signal?.aborted) {
        throw new Error('პროცესი შეჩერებულია მომხმარებლის მიერ.');
      }

      // Retry on 429 or 5xx server errors
      if ((res.status === 429 || (res.status >= 500 && res.status < 600)) && attempt < retries) {
        const wait = delay * Math.pow(1.5, attempt - 1) + Math.random() * 800;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        // Not JSON
      }

      if (!res.ok) {
        let msg = `API Error ${res.status}`;
        if (data && data.error) {
          msg = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
        } else if (raw) {
          msg = raw.slice(0, 200);
        }
        throw new Error(msg);
      }

      let text = '';
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        text = data.candidates[0].content.parts[0].text;
      } else if (data?.candidates?.[0]?.finishReason === 'SAFETY') {
        throw new Error('კონტენტი დაიბლოკა უსაფრთხოების ფილტრით (Safety Filter).');
      } else if (data?.choices?.[0]?.message?.content) {
        text = data.choices[0].message.content;
      } else if (data?.text) {
        text = data.text;
      }

      if (text && text.trim()) {
        return text;
      }

      throw new Error('API-მ დააბრუნა ცარიელი ტექსტური პასუხი.');
    } catch (err: any) {
      if (signal?.aborted) {
        throw new Error('პროცესი შეჩერებულია მომხმარებლის მიერ.');
      }
      if (isTimedOut) {
        throw new Error('API მოთხოვნის დრო ამოიწურა (Timeout: 120 წამი).');
      }
      if (err?.name === 'AbortError') {
        throw new Error('მოთხოვნა გაუქმდა.');
      }
      lastError = err;
      if (attempt >= retries) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, delay * attempt + Math.random() * 600));
    }
  }

  throw lastError || new Error('API გამოძახება ვერ მოხერხდა.');
}

/**
 * Strict Auditor Verdict Evaluator
 * Evaluates whether an audit response genuinely passes or requests fixes.
 */
export function evaluateAuditVerdict(auditText: string, sandboxOk: boolean): { isApproved: boolean; feedback: string } {
  const text = (auditText || '').trim();
  if (!sandboxOk) {
    return { isApproved: false, feedback: text || 'Sandbox runtime error must be resolved.' };
  }

  // Look for explicit structured verdict
  const verdictMatch = text.match(/VERDICT:\s*(OK|APPROVED|PASSED|NEEDS_FIXES|FIX|FAIL)/i);
  if (verdictMatch) {
    const verdict = verdictMatch[1].toUpperCase();
    if (verdict === 'OK' || verdict === 'APPROVED' || verdict === 'PASSED') {
      return { isApproved: true, feedback: '' };
    }
    return { isApproved: false, feedback: text };
  }

  // Fallback pattern matching
  const hasPureOk = /^(OK|PASSED|APPROVED)[.!]?$/i.test(text);
  const hasOkWord = /\bOK\b/i.test(text);
  const hasFailWords = /\b(NOT\s+OK|FAIL|FAILED|ERROR|BUG|FIX|ISSUE|SYNTAX|MISSING|INCOMPLETE|BROKEN|PROBLEM)\b/i.test(text);

  if (hasPureOk || (hasOkWord && !hasFailWords)) {
    return { isApproved: true, feedback: '' };
  }

  return { isApproved: false, feedback: text || 'Unknown audit failure.' };
}
