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

  // phát tín hiệu yêu cầu logout (nhiều nơi có thể bắn)
  private readonly _logoutReq$ = new Subject<void>();
  // đã logout (dùng để takeUntil hủy polling nếu cần)
  private readonly _loggedOut$ = new Subject<void>();
  loggedOut$ = this._loggedOut$.asObservable();

  constructor(private readonly router: Router, private readonly store: TokenStore) {}

  async isLoggedIn(): Promise<boolean> {
    const token = await this.store.getAccess();
    return !!token && !isJwtExpired(token);
  }

  requestLogout() {
    // chỉ phát tín hiệu, KHÔNG dọn dẹp/điều hướng ở đây
    this._logoutReq$.next();
  }

  /** Thực thi logout: clear token + user; KHÔNG navigate ở đây */
  async logout() {
    await this.store.clear();
    this._user$.next(null);
    this._loggedOut$.next(); // cho các stream khác hủy subscribe
  }

  /** Đăng ký handler trung tâm: đảm bảo logout chỉ chạy 1 lần cho nhiều tín hiệu */
  initGlobalLogoutHandler() {
    return this._logoutReq$.pipe(
      // Bỏ qua tín hiệu nếu đang xử lý 1 cái rồi
      exhaustMap(async () => {
        await this.logout();
        // điều hướng tập trung ở đây
        await this.router.navigateByUrl('/login', { replaceUrl: true });
      })
    ).subscribe();
  }

  async login(accessToken: string) {
    await this.store.setAccess(accessToken);
    this.setUserFromToken(accessToken);
  }

  async initFromStorage() {
    const token = await this.store.getAccess();
    if (!token) return;
    if (isJwtExpired(token)) {
      // chỉ yêu cầu logout; handler trung tâm sẽ xử lý
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

