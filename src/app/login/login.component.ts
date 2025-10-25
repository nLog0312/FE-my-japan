import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSegment } from '@ionic/angular';
import { MyJapanApiService } from '../services/my-japan';
import { AuthService } from '../services/auth';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { catchError, throwError, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../services/toast';
import { LoadingService } from '../services/loading.service';
import { Router } from '@angular/router';

type LoginForm = FormGroup<{
  user_name: FormControl<string>;
  password: FormControl<string>;
}>;

type RegisterForm = FormGroup<{
  user_name: FormControl<string>;
  password: FormControl<string>;
  email:    FormControl<string>;
  name:     FormControl<string>;
  locale:   FormControl<string>;
}>;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  constructor(
    private readonly myJapanApiService: MyJapanApiService,
    private readonly auth: AuthService,
    private readonly fb: FormBuilder,
    private readonly toast: ToastService,
    private readonly loading: LoadingService,
    private readonly router: Router
  ) { }

  @ViewChild(IonSegment) segment!: IonSegment;
  isPopoverOpen = false;
  popoverEvent: any;
  lstPopoverMessage = {
    mail: 'Email có thể bỏ trống nhưng hãy xác minh để nhận thông báo hoặc dùng để quên mật khẩu.',
    name: 'Mặc định sẽ lấy theo tên tài khoản.',
    locale: 'Chọn ngôn ngữ khi bắt đầu sử dụng, mặc định là tiếng Việt.'
  }
  popoverMessage = '';

  loginForm: LoginForm = this.fb.group({
    user_name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  registerForm: RegisterForm = this.fb.group({
    user_name: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: this.fb.control('', { nonNullable: true, validators: [Validators.required, passwordStrength] }),
    email:    this.fb.control('', { nonNullable: true, validators: [Validators.email] }),
    name:     this.fb.control('', { nonNullable: true, validators: [Validators.minLength(2)] }),
    locale:   this.fb.control('vi', { nonNullable: true, validators: [Validators.required] }),
  });

  get lf() { return this.loginForm.controls; }
  get rf() { return this.registerForm.controls; }

  ngOnInit() {

  }

  goTo(tab: string) {
    this.segment.value = tab;
  }

  showPopover(ev: Event, message: string) {
    this.popoverEvent = ev;
    this.popoverMessage = message;
    this.isPopoverOpen = true;
  }

  submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const payload = this.loginForm.value;
    // TODO: gọi API đăng nhập
    this.loading.show();
    this.myJapanApiService.apiV1AuthLogin(payload)
    .pipe(
      timeout(10000), // tránh treo request
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          // Không tới được server: mạng/ CORS/ server down
          console.error('Network/Server down:', err);
          this.toast.error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.');
        } else if (err.status === 401) {
          this.toast.error('Sai tài khoản hoặc mật khẩu.');
        } else if (err.status >= 500) {
          this.toast.error('Hệ thống đang bận. Thử lại sau ít phút.');
        } else {
          // Lỗi 4xx khác hoặc message từ backend
          const msg = (err.error && (err.error.message || err.error.msg)) || 'Có lỗi xảy ra.';
          this.toast.error(msg);
        }
        this.loading.hide();

        return throwError(() => err);
      })
    )
    .subscribe({
      next: async (r) => {
        if (r.statusCode && r.statusCode >= 400)
          this.toast.error(r.message)
        else {
          const accessToken = r?.data?.access_token;

          if (!accessToken) {
            console.error('Không tìm thấy accessToken trong ResponseDto:', r);
            this.toast.error('Phản hồi đăng nhập không hợp lệ');
            return;
          }

          await this.auth.login(accessToken);
          this.toast.success(r.message)
          this.router.navigate(['/myjapan']);
        }
      },
      error: (err) => {
        console.warn('Request failed:', err);
      },
      complete: () => { this.loading.hide(); }
    });
    this.loading.hide();
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const payload = this.registerForm.value;
    if(!payload.name) payload.name = payload.user_name;
    // TODO: gọi API đăng ký
    this.loading.show();
    this.myJapanApiService.apiV1AuthRegister(payload)
    .pipe(
      timeout(10000), // tránh treo request
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0) {
          // Không tới được server: mạng/ CORS/ server down
          console.error('Network/Server down:', err);
          this.toast.error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.');
        } else if (err.status >= 500) {
          this.toast.error('Hệ thống đang bận. Thử lại sau ít phút.');
        } else {
          // Lỗi 4xx khác hoặc message từ backend
          const msg = (err.error && (err.error.message || err.error.msg)) || 'Có lỗi xảy ra.';
          this.toast.error(msg);
        }

        return throwError(() => err);
      })
    )
    .subscribe({
      next: async (r) => {
        if (r.statusCode && r.statusCode >= 400)
          this.toast.error(r.message)
        else {
          const accessToken = r?.data?.access_token;

          if (!accessToken) {
            console.error('Không tìm thấy accessToken trong ResponseDto:', r);
            this.toast.error('Phản hồi đăng ký không hợp lệ');
            return;
          }

          await this.auth.login(accessToken);
          this.toast.success(r.message)
          this.router.navigate(['/myjapan']);
        }
      },
      error: (err) => {
        console.warn('Request failed:', err);
      },
      complete: () => { this.loading.hide(); }
    });
    this.loading.hide();
  }

}

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const pass: string = (control.value ?? '') as string;
  if (!pass) return null;
  const weak = pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass);
  return weak ? { weakPassword: true } : null;
}
