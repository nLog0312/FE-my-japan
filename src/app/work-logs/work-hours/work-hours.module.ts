import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkHoursPageRoutingModule } from './work-hours-routing.module';
import { WorkHoursComponent } from './work-hours.component';
import { WorklogCreateComponent } from '../worklog-create/worklog-create.component';
import { WorklogUpdateComponent } from '../worklog-update/worklog-update.component';
import { ZeroIfEmptyDirective } from 'src/app/directives/zero-if-empty.directive';
import { SearchBarModule } from 'src/app/search-bar/search-bar.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WorkHoursPageRoutingModule,
    ZeroIfEmptyDirective,
    SearchBarModule,
  ],
  declarations: [
    WorkHoursComponent,
    WorklogCreateComponent,
    WorklogUpdateComponent,
  ],
})
export class WorkHoursModule { }
