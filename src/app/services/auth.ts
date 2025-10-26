import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, exhaustMap, Subject } from 'rxjs';
import { TokenStore } from './token-store.service';
import { decodeJwt, isJwtExpired, JwtPayload } from '../helpers/jwt.util';

export interface AuthUser {
  id?: string;
  user_name?: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user$ = new BehaviorSubject<AuthUser | null>(null);
  user$ = this._user$.asObservable();

  private readonly _logoutReq$ = new Subject<void>();
  private readonly _loggedOut$ = new Subject<void>();
  loggedOut$ = this._loggedOut$.asObservable();

  constructor(private readonly router: Router, private readonly store: TokenStore) {}

  async isLoggedIn(): Promise<boolean> {
    const token = await this.store.getAccess();
    return !!token && !isJwtExpired(token);
  }

  requestLogout() {
    this._logoutReq$.next();
  }

  async logout() {
    await this.store.clear();
    this._user$.next(null);
    this._loggedOut$.next();
  }

  initGlobalLogoutHandler() {
    return this._logoutReq$.pipe(
      exhaustMap(async () => {
        await this.logout();
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      })
    ).subscribe();
  }

  async login(accessToken: string, remember = false) {
    await this.store.setAccess(accessToken, undefined, remember);
    this.setUserFromToken(accessToken);
  }

  async initFromStorage() {
    const token = await this.store.getAccess();
    if (!token) return;
    if (isJwtExpired(token)) {
      this.requestLogout();
      return;
    }
    this.setUserFromToken(token);
  }

  private setUserFromToken(token: string) {
    const payload = decodeJwt<JwtPayload>(token);
    this._user$.next(payload ? { id: payload.sub, user_name: payload.user_name, name: payload.name } : null);
  }
}

