import { Component, } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ModalController } from '@ionic/angular';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import type { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss'],
  standalone: false,
})
export class SettingsComponent {
  public alertButtons = [
    {
      text: 'Huỷ',
      role: 'cancel',
      // handler: () => {
      //   console.log('Alert canceled');
      // },
    },
    {
      text: 'Xoá luôn',
      role: 'confirm',
      cssClass: 'alert-button-confirm-delete'
      // handler: () => {
      //   console.log('Alert confirmed');
      // },
    },
  ];

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly modalCtrl: ModalController
  ) {}

  async openProfileModal() {
    const modal = await this.modalCtrl.create({
      component: ProfileModalComponent,
      cssClass: 'profile-modal'
    });
    await modal.present();
  }

  async openChangePassword() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordComponent
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.changed) {
      // làm gì đó sau khi đổi mật khẩu (optional)
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async deleteAccount() {

  }

  setResult(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      // Delete account
    }
  }

}
