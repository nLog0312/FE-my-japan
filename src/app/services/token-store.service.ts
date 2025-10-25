import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const ACCESS  = 'access_token';
const EXP     = 'access_expires_at';
const REFRESH = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  private memAccess: string | null = null;

  async setAccess(token: string, exp?: Date): Promise<void> {
    this.memAccess = token;

    if (Capacitor.isNativePlatform()) {
      await SecureStorage.set(ACCESS, token);
      if (exp) await SecureStorage.set(EXP, exp.toISOString());
    } else {
      sessionStorage.setItem(ACCESS, token);
      if (exp) sessionStorage.setItem(EXP, exp.toISOString());
    }
  }

  async getAccess(): Promise<string | null> {
    if (this.memAccess) return this.memAccess;

    if (Capacitor.isNativePlatform()) {
      const value = (await SecureStorage.get(ACCESS)) as string | null;
      return value ?? null;
    } else {
      return sessionStorage.getItem(ACCESS);
    }
  }

  async getExpiry(): Promise<Date | null> {
    if (Capacitor.isNativePlatform()) {
      const raw = (await SecureStorage.get(EXP)) as string | null;
      return raw ? new Date(raw) : null;
    } else {
      const raw = sessionStorage.getItem(EXP);
      return raw ? new Date(raw) : null;
    }
  }

  async setRefresh(token: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await SecureStorage.set(REFRESH, token);
    }
  }

  async getRefresh(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const value = (await SecureStorage.get(REFRESH)) as string | null;
      return value ?? null;
    }
    return null;
  }

  async clear(): Promise<void> {
    this.memAccess = null;

    if (Capacitor.isNativePlatform()) {
      await SecureStorage.remove(ACCESS);
      await SecureStorage.remove(EXP);
      await SecureStorage.remove(REFRESH);
    } else {
      sessionStorage.removeItem(ACCESS);
      sessionStorage.removeItem(EXP);
    }
  }
}
