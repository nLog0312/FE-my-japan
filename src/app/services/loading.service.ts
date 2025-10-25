// src/app/services/loading.service.ts
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading?: HTMLIonLoadingElement;

  constructor(private loadingCtrl: LoadingController) {}

  async show(message: string = 'Đang xử lý...') {
    if (this.loading) return; // tránh mở trùng
    this.loading = await this.loadingCtrl.create({
      message,
      spinner: 'lines-small',
      cssClass: 'custom-loading',
      backdropDismiss: false,
    });
    await this.loading.present();
  }

  async hide() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
    }
  }
}
