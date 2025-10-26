import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStorage } from '@aparajita/capacitor-secure-storage';

const ACCESS = 'access_token';
const EXP = 'access_expires_at';
const REFRESH = 'refresh_token';
const REMEMBER = 'remember_me';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  private memAccess: string | null = null;
  private readonly isNative = Capacitor.isNativePlatform();

  private getWebStorage(remember: boolean): Storage {
    return remember ? localStorage : sessionStorage;
  }

  private async setItem(key: string, value: string, remember?: boolean) {
    if (this.isNative) {
      await SecureStorage.set(key, value);
    } else {
      const storage = this.getWebStorage(remember ?? this.getRememberFlag());
      storage.setItem(key, value);
    }
  }

  private async getItem(key: string): Promise<string | null> {
    if (this.isNative) {
      return (await SecureStorage.get(key)) as string | null;
    }
    const remember = this.getRememberFlag();
    const storage = this.getWebStorage(remember);
    return storage.getItem(key);
  }

  private async removeItem(key: string) {
    if (this.isNative) {
      await SecureStorage.remove(key);
    } else {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  }

  async setRememberFlag(remember: boolean): Promise<void> {
    if (this.isNative) return;
    localStorage.setItem(REMEMBER, remember ? '1' : '0');
  }

  private getRememberFlag(): boolean {
    return localStorage.getItem(REMEMBER) === '1';
  }

  // --- Access token ---
  async setAccess(token: string, exp?: Date, remember = false): Promise<void> {
    this.memAccess = token;
    await this.setRememberFlag(remember);
    await this.setItem(ACCESS, token, remember);
    if (exp) await this.setItem(EXP, exp.toISOString(), remember);
  }

  async getAccess(): Promise<string | null> {
    if (this.memAccess) return this.memAccess;
    const token = await this.getItem(ACCESS);
    this.memAccess = token;
    return token;
  }

  async getExpiry(): Promise<Date | null> {
    const raw = await this.getItem(EXP);
    return raw ? new Date(raw) : null;
  }

  async isAccessExpired(): Promise<boolean> {
    const exp = await this.getExpiry();
    return exp ? Date.now() >= exp.getTime() : true;
  }

  async getRemainingTime(): Promise<number | null> {
    const exp = await this.getExpiry();
    return exp ? exp.getTime() - Date.now() : null;
  }

  async setRefresh(token: string): Promise<void> {
    await this.setItem(REFRESH, token);
  }

  async getRefresh(): Promise<string | null> {
    return await this.getItem(REFRESH);
  }

  async clear(): Promise<void> {
    this.memAccess = null;
    await this.removeItem(ACCESS);
    await this.removeItem(EXP);
    await this.removeItem(REFRESH);
    await this.removeItem(REMEMBER);
  }
}
