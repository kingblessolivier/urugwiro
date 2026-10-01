import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LogLevel = 'log' | 'warn' | 'error' | 'info';

interface SafeLogOptions {
  depth?: number;
  maxArrayLength?: number;
}

function sanitizeForLog(value: unknown, depth = 0, opts: Required<SafeLogOptions>): unknown {
  if (depth > opts.depth) return '[MaxDepth]';
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') return value;
  if (t === 'function') return `[Function: ${(value as any).name || 'anonymous'}]`;
  if (value instanceof Error) {
    return {
      _errorType: (value as any).name || 'Error',
      message: (value as any).message,
      stack: (value as any).stack ? String((value as any).stack).slice(0, 4000) : undefined,
    };
  }
  if (value instanceof Promise) return '[Promise]';
  try {
    if (value instanceof Date) return value.toISOString();
  } catch { /* noop */ }
  if (Array.isArray(value)) {
    const max = Math.min(value.length, opts.maxArrayLength);
    const arr: unknown[] = [];
    for (let i = 0; i < max; i++) {
      arr.push(sanitizeForLog(value[i], depth + 1, opts));
    }
    if (value.length > max) arr.push(`[...${value.length - max} more]`);
    return arr;
  }
  if (t === 'object') {
    try {
      const proto = Object.getPrototypeOf(value);
      if (proto && typeof proto === 'object' && !Array.isArray(proto) && typeof (proto as any).toString === 'function') {
        try {
          const str = (value as any).toString?.();
          if (typeof str === 'string' && str !== '[object Object]') return str;
        } catch { /* noop */ }
      }
    } catch { /* noop */ }
    const out: Record<string, unknown> = {};
    let count = 0;
    for (const k of Object.keys(value as Record<string, unknown>)) {
      if (count++ > 50) { out['__truncated'] = true; break; }
      try {
        out[k] = sanitizeForLog((value as Record<string, unknown>)[k], depth + 1, opts);
      } catch {
        out[k] = '[ReadError]';
      }
    }
    return out;
  }
  try { return String(value); } catch { return '[Unserializable]'; }
}

export function safeLog(level: LogLevel, message: string, ...args: unknown[]): void {
  const opts: Required<SafeLogOptions> = { depth: 5, maxArrayLength: 30 };
  try {
    const sanitized = args.map(a => sanitizeForLog(a, 0, opts));
    (console as any)[level](message, ...sanitized);
  } catch {
    try {
      const fallback = args.map(a => {
        try {
          if (a instanceof Error) return `${(a as any).name || 'Error'}: ${(a as any).message}`;
          if (a && typeof a === 'object') {
            try { return JSON.stringify(a, (_k, v) => typeof v === 'bigint' ? String(v) : v).slice(0, 2000); }
            catch { return '[Object]'; }
          }
          return String(a);
        } catch { return '[?]'; }
      });
      (console as any)[level](message, ...fallback);
    } catch {
      (console as any)[level](message + ' [logging args failed]');
    }
  }
}

export const logError = (msg: string, ...args: unknown[]) => safeLog('error', msg, ...args);
export const logWarn = (msg: string, ...args: unknown[]) => safeLog('warn', msg, ...args);
export const logInfo = (msg: string, ...args: unknown[]) => safeLog('info', msg, ...args);
export const logDebug = (msg: string, ...args: unknown[]) => safeLog('log', msg, ...args);
