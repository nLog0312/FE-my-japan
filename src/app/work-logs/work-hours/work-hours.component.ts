import { Component, OnInit } from '@angular/core';
import { AlertController, RefresherCustomEvent, ModalController, InfiniteScrollCustomEvent } from '@ionic/angular';
import { LoadingService } from '../../services/loading.service';
import { MyJapanApiService, WorkLogQueryDto } from '../../services/my-japan';
import { ToastService } from '../../services/toast';
import { firstValueFrom, lastValueFrom, take, takeUntil, timeout } from 'rxjs';
import { AuthService } from '../../services/auth';
import { WorklogCreateComponent } from '../worklog-create/worklog-create.component';
import { WorklogUpdateComponent } from '../worklog-update/worklog-update.component';
import { CURRENT_PAGE, PAGE_SIZE } from 'src/app/constants';

@Component({
  selector: 'app-work-hours',
  templateUrl: './work-hours.component.html',
  styleUrls: ['./work-hours.component.scss'],
  standalone: false,
})
export class WorkHoursComponent implements OnInit {
  now = new Date();
  body: WorkLogQueryDto = new WorkLogQueryDto();
  data_WorkLog: any;
  public loaded = false;
  public disabledInfinite = false;

  constructor(
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly loading: LoadingService,
    private readonly toast: ToastService,
    private readonly alertCtrl: AlertController,
    private readonly modalCtrl: ModalController,
  ) {}

  async ngOnInit(): Promise<void> {
    this.body.month = this.now.toISOString().slice(0, 7);
    await this.loadingData();
  }

  async loadingData() {
    try {
      const user = await firstValueFrom(this.auth.user$.pipe(take(1)));
      this.body.user_id = user?.id ?? '';
      this.body.current = CURRENT_PAGE;
      this.body.pageSize = PAGE_SIZE;
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1WorkLogsGetAll(this.body).pipe(
          timeout(10000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        if (this.body.current < res.data.total_pages)
          this.body.current += 1;
        else this.disabledInfinite = true;

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
    this.body.current = CURRENT_PAGE;
    this.body.day = undefined;
    this.body.month = this.now.toISOString().slice(0, 7);
    this.body.year = undefined;
    this.body.from = undefined;
    this.body.to = undefined;

    this.data_WorkLog = null;

    this.disabledInfinite = false;
    await this.loadingData();
    event.target.complete();
    this.loaded = true;
  }

  async onIonInfinite(event: InfiniteScrollCustomEvent) {
    try {
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1WorkLogsGetAll(this.body).pipe(
          timeout(10000),
          takeUntil(this.auth.loggedOut$)
        )
      );

      if (res.statusCode && res.statusCode >= 400) {
        this.toast.error(res.message);
      } else {
        if (this.body.current && this.body.current < res.data.total_pages)
          this.body.current += 1;
        else this.disabledInfinite = true;

        this.data_WorkLog.results = [ ...this.data_WorkLog.results, ...res.data.results ];
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
    event.target.complete();
  }

  async onSearchChange(event: any) {
    this.body.day = undefined;
    this.body.month = undefined;
    this.body.year = undefined;
    this.body.from = undefined;
    this.body.to = undefined;
    this.body.current = CURRENT_PAGE;

    switch (event.mode) {
      case 'year':
        this.body.year = event.value;
        break;
      case 'month':
        this.body.month = event.value;
        break;
      case 'day': {
        this.body.day = event.value;
        break;
      }
      case 'range':
        this.body.from = event.value.from;
        this.body.to = event.value.to;
        break;

      default:
        this.body.month = this.now.toISOString().slice(0, 7);
        break;
    }

    await this.loadingData();
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
