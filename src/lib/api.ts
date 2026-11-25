export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ||
    'https://klinik-hr-api.m-rizqi-winassyabani-umn.workers.dev').replace(/\/+$/, '');

export const ADMIN_TOKEN_COOKIE = 'klinik_hr_admin_token';

export function getAdminTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${ADMIN_TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null;
}

export function setAdminTokenCookie(token: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAdminTokenCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('Content-Type') && !(rest.body instanceof FormData)) {
    mergedHeaders.set('Content-Type', 'application/json');
  }
  if (token) {
    mergedHeaders.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error((errBody as { error?: string }).error || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}
