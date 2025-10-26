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
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: API_BASE_URL, useValue: environment.API_BASE_URL },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'vi' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
