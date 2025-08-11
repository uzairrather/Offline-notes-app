// web/src/api/client.ts
const BASE =
  // if you set Vite env var, it wins; otherwise fallback to localhost
  (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:4000';

export async function canReachServer(timeoutMs = 1500): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}/health`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`POST ${path} failed: ${res.status} ${detail}`);
  }
  return res.json() as Promise<T>;
}
