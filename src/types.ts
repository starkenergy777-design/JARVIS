export type ApiFormat = 'openai-compatible' | 'direct-endpoint' | 'google-format';
export type Language = 'ka' | 'en';

export interface AgentConfig {
  key: string;
  url: string;
  model: string;
  apiFormat: ApiFormat;
  cycles: number; // Any positive integer (no upper limit); 0 means unlimited
  fileName: string;
  rules: string;
  customHeaders?: string; // Optional JSON string for custom headers
}

export interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'cycle' | 'audit';
}

export interface SandboxResult {
  ok: boolean;
  msg: string | null;
}

export type ViewMode = 'logs' | 'preview' | 'code' | 'fixes';

export interface AutoSaveBackup {
  idea: string;
  code: string;
  timestamp: string;
  cycle?: number;
}

