import { Component, OnInit } from '@angular/core';
import { AlertController, RefresherCustomEvent, ModalController } from '@ionic/angular';
import { LoadingService } from '../../services/loading.service';
import { MyJapanApiService, WorkLogQueryDto } from '../../services/my-japan';
import { ToastService } from '../../services/toast';
import { firstValueFrom, lastValueFrom, take, takeUntil, timeout } from 'rxjs';
import { AuthService } from '../../services/auth';
import { WorklogCreateComponent } from '../worklog-create/worklog-create.component';
import { WorklogUpdateComponent } from '../worklog-update/worklog-update.component';

@Component({
  selector: 'app-work-hours',
  templateUrl: './work-hours.component.html',
  styleUrls: ['./work-hours.component.scss'],
  standalone: false,
})
export class WorkHoursComponent implements OnInit {
  now = new Date();
  body: WorkLogQueryDto = new WorkLogQueryDto;
  public loaded = false;
  data_WorkLog: any;

  constructor(
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly loading: LoadingService,
    private readonly toast: ToastService,
    private readonly alertCtrl: AlertController,
    private readonly modalCtrl: ModalController,
  ) {}

  ngOnInit(): void {
    this.loadingData();
  }

  async loadingData() {
    try {
      const user = await firstValueFrom(this.auth.user$.pipe(take(1)));
      this.body.user_id = user?.id ?? '';
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1WorkLogsGetAll(this.body).pipe(
          timeout(10000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        this.data_WorkLog = res.data;
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
      this.loaded = true;
    }
  }

  async handleRefresh(event: RefresherCustomEvent) {
    this.loaded = false;
    await this.loadingData();
    event.target.complete();
    this.loaded = true;
  }

  async addEntry() {
    const modal = await this.modalCtrl.create({
      component: WorklogCreateComponent,
      componentProps: {
        user_id: this.body.user_id
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data)
      this.loadingData();
  }

  async onEdit(workLog: any) {
    const modal = await this.modalCtrl.create({
      component: WorklogUpdateComponent,
      componentProps: {
        workLog: workLog
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data)
      this.loadingData();
  }

  async onDelete(workLog: any) {
    const formattedDate = new Date(workLog.start_time)
      .toLocaleDateString('vi-VN')
      .replace(/\//g, '-');
    const a = await this.alertCtrl.create({
      header: 'Xóa ngày làm',
      message: `Xóa ngày ${formattedDate}?`,
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        { text: 'Xóa', role: 'destructive', handler: async () => {
          try {
            this.loading.show();
            const res = await lastValueFrom(
              this.myJapanApiService.apiV1WorkLogsDeleteWorkLog(workLog._id).pipe(
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
            this.data_WorkLog.results = this.data_WorkLog.results.filter((w: any) => w !== workLog);
          }
        }},
      ],
    });
    await a.present();
  }
}
