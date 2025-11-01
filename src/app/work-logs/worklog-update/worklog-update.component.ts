import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { lastValueFrom, takeUntil, timeout } from 'rxjs';
import { AuthService } from 'src/app/services/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { MyJapanApiService } from 'src/app/services/my-japan';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-worklog-update',
  templateUrl: './worklog-update.component.html',
  styleUrls: ['./worklog-update.component.scss'],
  standalone: false,
})
export class WorklogUpdateComponent implements OnInit {
  @Input() workLog: any;
  form!: FormGroup;
  loaded = false;

  isPopoverOpen = false;
  popoverEvent: any;
  popoverMessage = 'Setup theo tài khoản hoặc nhập thủ công';

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
      start_time: [this.workLog?.start_time, Validators.required],
      end_time: [this.workLog?.end_time, Validators.required],
      break_minutes: [this.workLog?.break_minutes, [Validators.required, Validators.min(0)]],
      hourly_rate: [this.workLog?.hourly_rate, [Validators.required, Validators.min(0)]],
      regular_hours: [this.workLog?.regular_hours, [Validators.min(0)]],
      is_overtime: [this.workLog?.is_overtime],
      overtime_hours: [this.workLog?.overtime_hours, [Validators.min(0)]],
      overtime_multiplier: [this.workLog?.overtime_multiplier, [Validators.min(0)]],
      note: [this.workLog?.note],
    });

    this.loaded = true;
  }

  showPopover(event: any) {
    this.popoverEvent = event;
    this.isPopoverOpen = true;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.toast.error('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    // check the data
    const formValue = { ...this.form.value };
    if (!formValue.is_overtime) {
      formValue.overtime_hours = 0;
      formValue.overtime_multiplier = 0;
    }

    if (formValue.regular_hours === 0 && formValue.overtime_hours === 0) {
      this.toast.error('Giờ thường và giờ tăng ca không thể cùng lúc bằng 0.');
      return;
    }

    const updated = { ...this.workLog, ...formValue };

    try {
      this.loading.show();
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1WorkLogsUpdateWorkLog(updated).pipe(
          timeout(10000),
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

  dismiss(data?: any) {
    this.modalCtrl.dismiss(data);
  }
}
