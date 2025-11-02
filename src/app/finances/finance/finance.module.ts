import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinancePageRoutingModule } from './finance-routing.module';
import { FinanceComponent } from './finance.component';
import { FinanceCreateComponent } from '../finance-create/finance-create.component';
import { FinanceUpdateComponent } from '../finance-update/finance-update.component';
import { NoDataModule } from 'src/app/common/no-data/no-data.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FinancePageRoutingModule,
    NoDataModule,
  ],
  declarations: [
    FinanceComponent,
    FinanceCreateComponent,
    FinanceUpdateComponent,
  ],
})
export class FinancesModule { }
