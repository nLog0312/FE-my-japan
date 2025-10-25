import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TokenStore } from '../services/token-store.service';
import { AuthService } from '../services/auth';
import { isJwtExpired } from '../helpers/jwt.util';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly store: TokenStore, private readonly auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.store.getAccess()).pipe(
      switchMap(token => {
        // Nếu token hết hạn -> yêu cầu logout, đừng navigate tại đây
        if (token && isJwtExpired(token)) {
          this.auth.requestLogout();
          // cắt pipeline request hiện tại bằng cách ném 401 giả
          return throwError(() => new HttpErrorResponse({
            status: 401,
            error: 'TOKEN_EXPIRED'
          }));
        }

        const withAuth = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
        return next.handle(withAuth).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              // Token invalid/expired từ server -> yêu cầu logout 1 lần
              this.auth.requestLogout();
            }
            return throwError(() => err);
          })
        );
      })
    );
  }
}

