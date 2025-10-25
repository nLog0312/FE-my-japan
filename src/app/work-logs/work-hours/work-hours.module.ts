import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkHoursPageRoutingModule } from './work-hours-routing.module';
import { WorkHoursComponent } from './work-hours.component';
import { WorklogCreateComponent } from '../worklog-create/worklog-create.component';
import { WorklogUpdateComponent } from '../worklog-update/worklog-update.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WorkHoursPageRoutingModule
  ],
  declarations: [
    WorkHoursComponent,
    WorklogCreateComponent,
    WorklogUpdateComponent,
  ],
})
export class WorkHoursModule { }
