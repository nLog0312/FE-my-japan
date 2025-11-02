import { Component, OnInit } from '@angular/core';
import { AlertController, InfiniteScrollCustomEvent, ModalController, RefresherCustomEvent } from '@ionic/angular';
import { FinanceCreateComponent } from '../finance-create/finance-create.component';
import { firstValueFrom, take, lastValueFrom, timeout, takeUntil } from 'rxjs';
import { CURRENT_PAGE, PAGE_SIZE } from 'src/app/constants';
import { AuthService } from 'src/app/services/auth';
import { LoadingService } from 'src/app/services/loading.service';
import { MonthSheetQueryDto, MyJapanApiService } from 'src/app/services/my-japan';
import { ToastService } from 'src/app/services/toast';
import { FinanceUpdateComponent } from '../finance-update/finance-update.component';

type TxType = 'income' | 'expense';

interface Transaction {
  id: string;
  title: string;
  note?: string;
  dateISO: string;     // '2025-10-13'
  amount: number;      // dương cho income, âm cho expense
  type: TxType;
  tagColor?: string;   // 'success' | 'danger' | 'warning' ...
}

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  standalone: false,
})
export class FinanceComponent implements OnInit {
  now = new Date();
  segment: 'all' | TxType = 'all';
  body: MonthSheetQueryDto = new MonthSheetQueryDto();
  data_Finance: any;
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
    await this.loadingData();
  }

  async loadingData() {
    try {
      const user = await firstValueFrom(this.auth.user$.pipe(take(1)));
      this.body.user_id = user?.id ?? '';
      this.body.current = CURRENT_PAGE;
      this.body.pageSize = PAGE_SIZE;
      const res = await lastValueFrom(
        this.myJapanApiService.apiV1MonthlySheetsGetAll(this.body).pipe(
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

        this.data_Finance = res.data;
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

    this.data_Finance = null;

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

        this.data_Finance.results = [ ...this.data_Finance.results, ...res.data.results ];
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

  get filteredFinances() {
    if (this.segment === 'all') return this.data_Finance.results;
    if (this.segment === 'income')
      return this.data_Finance.results.filter((t: { kind: boolean; }) => t.kind === true);

    return this.data_Finance.results.filter((t: { kind: boolean; }) => t.kind === false);
  }

  async addEntry() {
    const modal = await this.modalCtrl.create({
      component: FinanceCreateComponent,
      componentProps: {
        user_id: this.body.user_id
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data)
      this.loadingData();
  }

  async onEdit(finance: any) {
    const modal = await this.modalCtrl.create({
      component: FinanceUpdateComponent,
      componentProps: {
        finance: finance
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data)
      this.loadingData();
  }

  async onDelete(finance: any) {
    const formattedDate = new Date(finance.entry_date)
      .toLocaleDateString('vi-VN')
      .replace(/\//g, '-');
      const type = finance.kind ? 'thu' : 'chi';
    const a = await this.alertCtrl.create({
      header: `Xóa ${type}`,
      message: `Xóa ${type} ngày ${formattedDate}?`,
      buttons: [
        { text: 'Hủy', role: 'cancel' },
        { text: 'Xóa', role: 'destructive', handler: async () => {
          try {
            this.loading.show();
            const res = await lastValueFrom(
              this.myJapanApiService.apiV1MonthlySheetsDeleteMonthlySheet(finance._id).pipe(
                timeout(10000),
                takeUntil(this.auth.loggedOut$)
              )
            );

            if (res.statusCode && res.statusCode >= 400) {
              this.toast.error(res.message);
            } else {
              this.data_Finance.results = this.data_Finance.results.filter((w: any) => w !== finance);
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
          }
        }},
      ],
    });
    await a.present();
  }
}
