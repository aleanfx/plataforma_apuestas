// Cliente REST del frontend hacia el backend de BetmarPlay.
// Maneja la URL base, el token JWT (bearer) y el parseo de errores.

import { markServerWaking, markServerOnline } from "@/lib/server-status";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const ACCESS_KEY = "bmp_access";
const REFRESH_KEY = "bmp_refresh";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  _retried?: boolean;
};

/** Intenta renovar el access token con el refresh token. Devuelve true si lo logró. */
export async function refreshAccess(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    setTokens(data.access, data.refresh);
    return true;
  } catch {
    return false;
  }
}

/** Llama a la API. Adjunta el bearer token si `auth` (default true) y hay token.
 *  Si recibe 401, intenta renovar el token una vez y reintenta. */
export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, auth = true, headers, _retried, ...rest } = opts;
  const h = new Headers(headers);
  if (body !== undefined) h.set("Content-Type", "application/json");
  if (auth) {
    const token = getToken();
    if (token) h.set("Authorization", `Bearer ${token}`);
  }

  // Si la respuesta tarda demasiado, el servidor (Render free) probablemente está
  // despertando: avisamos para mostrar el overlay, pero NO abortamos la petición.
  let res: Response;
  const slowTimer = setTimeout(markServerWaking, 4000);
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    markServerWaking(); // error de red: servidor inalcanzable / arrancando
    throw err;
  } finally {
    clearTimeout(slowTimer);
  }
  markServerOnline(); // el servidor respondió (aunque sea un error HTTP): está vivo

  // Token expirado: renueva una vez y reintenta.
  if (res.status === 401 && auth && !_retried && getRefreshToken()) {
    if (await refreshAccess()) {
      return api<T>(path, { ...opts, _retried: true });
    }
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Error ${res.status}`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export const API_BASE = API_URL;
