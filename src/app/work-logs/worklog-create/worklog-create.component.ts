import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { firstValueFrom, take, lastValueFrom, timeout, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { MyJapanApiService } from 'src/app/services/my-japan';
import { ToastService } from 'src/app/services/toast';

@Component({
  selector: 'app-worklog-create',
  templateUrl: './worklog-create.component.html',
  styleUrls: ['./worklog-create.component.scss'],
  standalone: false,
})
export class WorklogCreateComponent implements OnInit {
  @Input() user_id!: string;
  form!: FormGroup;
  isPopoverOpen = false;
  popoverEvent: any;
  popoverMessage = 'Setup theo tài khoản hoặc nhập thủ công';
  public loaded = false;
  setup_worklog: any;

  constructor(
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly toast: ToastService,
    private readonly loading: LoadingService,
    private readonly fb: FormBuilder,
    private readonly modalCtrl: ModalController,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadingData();
    this.form = this.fb.group({
      user_id: [this.user_id],
      start_time: [null, Validators.required],
      end_time: [null, Validators.required],
      break_minutes: [60, [Validators.required, Validators.min(0)]],
      hourly_rate: [this.setup_worklog.hourly_rate ?? 0, [Validators.required, Validators.min(0)]],
      regular_hours: [8],
      is_overtime: [false],
      overtime_hours: [0],
      overtime_multiplier: [this.setup_worklog.overtime_multiplier ?? 0],
      note: [null],
    });

    if (this.setup_worklog.start_time) {
      const today = new Date().toISOString().split('T')[0];
      const isoValue = `${today}T${this.setup_worklog.start_time}`;

      this.form.get('start_time')?.setValue(isoValue);
    }

    if (this.setup_worklog.end_time) {
      const today = new Date().toISOString().split('T')[0];
      const isoValue = `${today}T${this.setup_worklog.end_time}`;

      this.form.get('end_time')?.setValue(isoValue);
    }
  }

  async loadingData() {
    try {
      this.loading.show();
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1UsersGetSetupWorklog(this.user_id).pipe(
          timeout(10000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        this.setup_worklog = res.data;
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

  showPopover(ev: Event) {
    this.popoverEvent = ev;
    this.isPopoverOpen = true;
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
        this.myJapanApiService.apiV1WorkLogs(data).pipe(
          timeout(10000),
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
      this.loaded = true;
      this.dismiss(data);
    }
  }
}
