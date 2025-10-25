import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';


import { SettingsPageRoutingModule } from './settings-routing.module';
import { ProfileModalComponent } from '../profile-modal/profile-modal.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SettingsPageRoutingModule
  ],
  declarations: [
    SettingsComponent,
    ProfileModalComponent,
    ChangePasswordComponent,
  ],
})
export class SettingsModule { }
