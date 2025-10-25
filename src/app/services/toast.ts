import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  constructor(private readonly toastController: ToastController) {}

  async show(message: string, color: string = 'primary', icon?: string, duration: number = 5000, position: 'top'|'middle'|'bottom' = 'top') {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color, // 'success' | 'warning' | 'danger' | 'medium' | 'dark'...
      // buttons: [
      //   {
      //     text: 'Đóng',
      //     role: 'cancel'
      //   }
      // ],
      icon,
      animated: true,
    });
    await toast.present();
  }

  /** Toast thành công */
  success(message: string = 'success') {
    return this.show(message, 'success', 'checkmark-circle');
  }

  /** Toast lỗi */
  error(message: string = 'error') {
    return this.show(message, 'danger', 'close-circle');
  }

  /** Toast cảnh báo */
  warning(message: string = 'warning') {
    return this.show(message, 'warning', 'alert-circle');
  }

  /** Toast thông tin */
  info(message: string = 'notification') {
    return this.show(message, 'primary', 'chatbubbles');
  }
}
