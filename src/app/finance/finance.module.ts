import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinancePageRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FinancePageRoutingModule
  ],
  declarations: [
    FinanceComponent,
  ],
})
export class WorkHoursModule { }
