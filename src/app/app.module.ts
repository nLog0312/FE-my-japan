import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { API_BASE_URL } from './services/my-japan';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import localeVi from '@angular/common/locales/vi';
import localeJa from '@angular/common/locales/ja';
import { CommonModule, registerLocaleData } from '@angular/common';
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

registerLocaleData(localeVi, 'vi');
registerLocaleData(localeJa, 'ja-JP');

@NgModule({
  declarations: [ AppComponent ],
  imports: [
    CommonModule,
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: API_BASE_URL, useValue: environment.API_BASE_URL },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'vi' },
    { provide: NZ_I18N, useValue: vi_VN }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
