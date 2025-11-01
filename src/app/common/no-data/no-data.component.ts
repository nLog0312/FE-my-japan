// File: src/app/components/no-data/no-data.component.ts
// A reusable "No Data" component for Ionic + Angular
// Usage: <app-no-data [message]="'Không có dữ liệu'" [submessage]="'Thử lọc khác'" [showButton]="true" buttonText="Tải lại" (buttonClick)="reload()"></app-no-data>

import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss'],
  standalone: false,
})
export class NoDataComponent {
  @Input() message: string = 'No data';

  @Input() submessage?: string;
}
