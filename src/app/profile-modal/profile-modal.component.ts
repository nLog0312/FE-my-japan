import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MyJapanApiService } from '../services/my-japan';
import { timeout, catchError, throwError, firstValueFrom, take, takeUntil } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss'],
  standalone: false,
})
export class ProfileModalComponent implements OnInit {
  profile = {
    _id: '',
    email: '',
    name: '',
    locale: '',
    setup_worklog: {
      auto: false,
      start_time: '',
      end_time: '',
      hourly_rate: 0,
      overtime_multiplier: 0,
    }
  };
  isActiveEmail = false;
  currentEmail = '';

  isPopoverOpen = false;
  popoverEvent: any;
  lstPopoverMessage = {
    locale: 'Chọn ngôn ngữ khi bắt đầu sử dụng, mặc định là tiếng Việt.'
  }
  popoverMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly myJapanApiService: MyJapanApiService,
    private readonly modalCtrl: ModalController,
    private readonly loading: LoadingService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadingData();
  }

  async loadingData() {
    this.loading.show();
    try {
      const user = await firstValueFrom(this.auth.user$.pipe(take(1)));
      this.profile._id = user?.id ?? '';
      this.myJapanApiService.apiV1UsersGetOne(this.profile._id)
      .pipe(
        timeout(10000),
        takeUntil(this.auth.loggedOut$),
      )
      .subscribe({
        next: async (r) => {
          if (r.statusCode && r.statusCode >= 400)
            this.toast.error(r.message)
          else {
            const { is_active_email, ...rest } = r.data;
            this.profile = { _id: user?.id, ...rest }
            this.currentEmail = r.data.email;
            this.isActiveEmail = is_active_email;
          }
        },
        error: (err) => {
          console.warn('Request failed:', err);
        },
        complete: () => { this.loading.hide(); }
      });
    } catch (err: any) {
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
    }
    finally {
      this.loading.hide();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  showPopover(ev: Event, message: string) {
    this.popoverEvent = ev;
    this.popoverMessage = message;
    this.isPopoverOpen = true;
  }

  showAutoWorkLogSetup(event: any) {
    this.profile.setup_worklog.auto = event.currentTarget.checked;
  }

  save() {
    this.loading.show();
    this.myJapanApiService.apiV1UsersUpdateUserInformation(this.profile)
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
          this.modalCtrl.dismiss(this.profile);
        }
      },
      error: (err) => {
        console.warn('Request failed:', err);
      },
      complete: () => { this.loading.hide(); }
    });
  }
}
