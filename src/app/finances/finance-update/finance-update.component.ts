import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { lastValueFrom, takeUntil, timeout } from 'rxjs';
import { AuthService } from 'src/app/services/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { MyJapanApiService } from 'src/app/services/my-japan';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-finance-update',
  templateUrl: './finance-update.component.html',
  styleUrls: ['./finance-update.component.scss'],
  standalone: false,
})
export class FinanceUpdateComponent implements OnInit {
  @Input() finance: any;
  form!: FormGroup;
  loaded = false;

  constructor(
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly toast: ToastService,
    private readonly loading: LoadingService,
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      entry_date: [this.finance?.entry_date, Validators.required],
      kind: [this.finance?.kind, Validators.required],
      amount: [this.finance?.amount, [Validators.required, Validators.min(1)]],
      name: [this.finance?.name, Validators.required],
      note: [this.finance?.note],
    });

    this.loaded = true;
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toast.error('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    const updated = { ...this.finance, ...this.form.value };
    try {
      this.loading.show();
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1MonthlySheetsUpdateMonthlySheet(updated).pipe(
          timeout(60000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        this.toast.success(res.message);

        this.dismiss(updated);
      }
    } catch (err: any) {
      if (err?.status === 0) {
        this.toast.error('Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.');
      } else if (err?.status >= 500) {
        this.toast.error('Hệ thống đang bận. Thử lại sau ít phút.');
      } else {
        console.log(err);

        const msg = (err?.error && (err.error.message || err.error.msg)) || 'Có lỗi xảy ra.';
        this.toast.error(msg);
      }
    } finally {
      this.loading.hide();
      this.loaded = true;
    }
  }
}
