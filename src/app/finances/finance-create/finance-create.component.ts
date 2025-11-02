import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ModalController } from '@ionic/angular';
import { lastValueFrom, takeUntil, timeout } from 'rxjs';
import { AuthService } from 'src/app/services/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { MyJapanApiService } from 'src/app/services/my-japan';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-finance-create',
  templateUrl: './finance-create.component.html',
  styleUrls: ['./finance-create.component.scss'],
  standalone: false,
})
export class FinanceCreateComponent implements OnInit {
  now = new Date();
  @Input() user_id!: string;
  form!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly toast: ToastService,
    private readonly loading: LoadingService,
    private readonly modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      user_id: [this.user_id],
      entry_date: [this.now.toISOString(), Validators.required],
      kind: [false, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      name: ['', Validators.required],
      note: [''],
    });
  }

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toast.error('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    const data = this.form.value;
    try {
      this.loading.show();
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1MonthlySheets(data).pipe(
          timeout(60000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        this.toast.success(res.message);
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
      this.dismiss(data);
    }
  }
}
