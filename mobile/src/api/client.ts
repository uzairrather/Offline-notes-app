import { SERVER_URL } from './config';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string) {
  const res = await fetch(`${SERVER_URL}${path}`);
  return handle<T>(res);
}

export async function apiPost<T>(path: string, body: unknown) {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}
