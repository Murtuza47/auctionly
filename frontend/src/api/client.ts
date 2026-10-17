const base = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; errors: Record<string, string> }

export async function api<T>(path: string, options: { method?: string; body?: unknown; token?: string | null } = {}): Promise<ApiResult<T>> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 2500)
  try {
    const response = await fetch(`${base}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    })
    const data = (await response.json().catch(() => ({}))) as T & { errors?: Record<string, string> }
    if (!response.ok) return { ok: false, status: response.status, errors: data.errors ?? {} }
    return { ok: true, status: response.status, data }
  } catch {
    return { ok: false, status: 0, errors: {} }
  } finally {
    window.clearTimeout(timer)
  }
}
