export interface JwtPayload {
  sub?: string;
  user_name?: string;
  name?: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
}

// Base64URL -> JSON
export function decodeJwt<T = JwtPayload>(jwt: string): T | null {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isJwtExpired(jwt: string, skewSeconds = 0): boolean {
  const payload = decodeJwt(jwt);
  if (!payload?.exp) return false; // không có exp thì coi như không kiểm tra
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= payload.exp - skewSeconds;
}
