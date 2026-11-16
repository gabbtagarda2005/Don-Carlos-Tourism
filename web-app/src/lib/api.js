import { useCallback, useEffect, useRef, useState } from 'react';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

const TOKEN_KEY = 'dct_token';

export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Small fetch wrapper. Throws ApiError with status 0 on network failure / timeout.
 */
export async function api(path, { method = 'GET', body, timeout = 30000, raw = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const token = tokenStore.get();
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(
      e.name === 'AbortError'
        ? 'The server is taking too long to respond. It may be waking up — please try again in a moment.'
        : 'Unable to reach the server. Please check your connection and try again.',
      0
    );
  } finally {
    clearTimeout(timer);
  }

  if (raw) {
    if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
    return res;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('dct:unauthorized'));
    throw new ApiError(data.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}

/** Wake up the API (Render free instances sleep when idle). */
export const warmUp = () => fetch(`${API_URL}/health`).catch(() => {});

/**
 * Fetch data from the API. When `fallback` is provided it is shown immediately and kept if the
 * API is unreachable, so public pages always render something beautiful.
 */
export function useApi(path, { fallback, select = (d) => d.data, deps = [] } = {}) {
  const [state, setState] = useState({
    data: fallback,
    loading: true,
    error: null,
    live: false,
  });
  const selectRef = useRef(select);
  selectRef.current = select;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const json = await api(path);
      setState({ data: selectRef.current(json), loading: false, error: null, live: true });
    } catch (error) {
      setState({
        data: fallbackRef.current !== undefined && error.status === 0 ? fallbackRef.current : undefined,
        loading: false,
        error,
        live: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load, setData: (data) => setState((s) => ({ ...s, data })) };
}
