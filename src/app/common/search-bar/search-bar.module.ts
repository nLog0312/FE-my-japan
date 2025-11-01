import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchDateComponent } from './search-date/search-date.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzDatePickerModule
  ],
  declarations: [
    SearchDateComponent,
  ],
  exports: [
    SearchDateComponent,
  ]
})
export class SearchBarModule { }
