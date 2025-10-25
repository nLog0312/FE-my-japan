import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ToastService } from '../services/toast';
import { LoadingService } from '../services/loading.service';
import { AuthService } from '../services/auth';
import { MyJapanApiService } from '../services/my-japan';
import { catchError, firstValueFrom, lastValueFrom, take, takeUntil, throwError, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

type ChangePasswordForm = FormGroup<{
  old_password: FormControl<string>;
  new_password: FormControl<string>;
  confirm_password: FormControl<string>;
}>;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: false,
})
export class ChangePasswordComponent {
  changePasswordForm: ChangePasswordForm = this.fb.group(
    {
      old_password: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      new_password: this.fb.control('', { nonNullable: true, validators: [Validators.required, passwordStrength] }),
      confirm_password: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    },
    { validators: passwordMatchValidator }
  ) as ChangePasswordForm;

  get cpf() { return this.changePasswordForm.controls; }

  constructor(
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly modalCtrl: ModalController,
    private readonly toast: ToastService,
    private readonly loading: LoadingService,
    private readonly fb: FormBuilder,
  ) {}

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  async submit() {
    this.changePasswordForm.markAllAsTouched();
    if (this.changePasswordForm.invalid) return;

    const { old_password, new_password } = this.changePasswordForm.getRawValue();

    this.loading.show();
    try {
      const user = await firstValueFrom(this.auth.user$.pipe(take(1)));
      const _id = user?.id ?? '';

      const res = await lastValueFrom(
        this.myJapanApiService.apiV1UsersChangePassword({
          _id,
          old_password,
          new_password,
        }).pipe(
          timeout(10000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        this.toast.success(res.message);
        this.dismiss({ changed: true });
      }
    } catch (err: any) {
      if (err?.status === 0) {
        this.toast.error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.');
      } else if (err?.status >= 500) {
        this.toast.error('Hệ thống đang bận. Thử lại sau ít phút.');
      } else {
        const msg = (err?.error && (err.error.message || err.error.msg)) || 'Có lỗi xảy ra.';
        this.toast.error(msg);
      }
    } finally {
      this.loading.hide();
    }
  }
}

function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const pass: string = (control.value ?? '') as string;
  if (!pass) return null;
  const weak = pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass);
  return weak ? { weakPassword: true } : null;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newCtrl = group.get('new_password');
  const confirmCtrl = group.get('confirm_password');
  if (!newCtrl || !confirmCtrl) return null;

  const newVal = newCtrl.value ?? '';
  const confirmVal = confirmCtrl.value ?? '';

  const otherErrors = { ...(confirmCtrl.errors ?? {}) };
  delete (otherErrors as any)['passwordMismatch'];

  if (confirmVal && newVal !== confirmVal) {
    confirmCtrl.setErrors({ ...otherErrors, passwordMismatch: true });
  } else {
    const hasOther = Object.keys(otherErrors).length > 0;
    confirmCtrl.setErrors(hasOther ? otherErrors : null);
  }
  return null;
}
