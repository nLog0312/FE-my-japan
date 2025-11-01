import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { IonAccordionGroup } from '@ionic/angular';
import { NzStatus } from 'ng-zorro-antd/core/types';
import { NzDatePickerComponent } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-search-date',
  templateUrl: './search-date.component.html',
  styleUrls: ['./search-date.component.scss'],
  standalone: false,
})
export class SearchDateComponent {
  now = new Date();
  @Output() searchChange = new EventEmitter<any>();

  mode: 'year' | 'month' | 'day' | 'range' = 'month';
  value: string = this.now.toISOString().slice(0, 7);
  rangeValue: { start?: Date; end?: Date } = {};
  errorStartDate: NzStatus = '';
  errorEndDate: NzStatus = '';

  @ViewChild('endDatePicker') endDatePicker!: NzDatePickerComponent;
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;

  onModeChange(event: any) {
    this.rangeValue = {};
    switch (event.detail.value) {
      case 'year':
        this.value = this.now.getFullYear().toString();
        break;
      case 'month':
        this.value = this.now.toISOString().slice(0, 7);
        break;
      case 'day': {
        const year = this.now.getFullYear();
        const month = String(this.now.getMonth() + 1).padStart(2, '0');
        const day = String(this.now.getDate()).padStart(2, '0');
        this.value = `${year}-${month}-${day}`;
        break;
      }
      case 'range':
        this.value = this.now.toISOString().slice(0, 7);
        break;

      default:
        this.value = this.now.toISOString().slice(0, 7);
        break;
    }
  }

  changeValue(event: any) {
    const selectedValue = new Date(event.detail.value);
    switch (this.mode) {
      case 'year':
        this.value = selectedValue.getFullYear().toString();
        break;
      case 'month':
        this.value = selectedValue.toISOString().slice(0, 7);
        break;
      case 'day': {
        const year = selectedValue.getFullYear();
        const month = String(selectedValue.getMonth() + 1).padStart(2, '0');
        const day = String(selectedValue.getDate()).padStart(2, '0');
        this.value = `${year}-${month}-${day}`;
        break;
      }
      default:
        this.value = this.now.toISOString().slice(0, 7);
        break;
    }
    // this.value = event.detail.value;
  }

  emitRangeChange(event: any) {
    console.log(event);

    const value = event.detail.value || {};
    this.rangeValue = value;
    if (value.start && value.end) {
      this.searchChange.emit({ mode: this.mode, value });
    }
  }

  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue || !this.rangeValue.end) {
      return false;
    }
    return startValue.getTime() > this.rangeValue.end.getTime();
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.rangeValue.start) {
      return false;
    }
    return endValue.getTime() <= this.rangeValue.start.getTime();
  };

  openChange(open: boolean): void {
    if (!open) {
      this.endDatePicker.open();
    }
  }

  reset() {
    this.rangeValue = {};
    this.searchChange.emit({ mode: 'month', value: this.now.toISOString().slice(0, 7) });
  }

  emitSearch() {
    if (this.mode === 'range') {
      if (!this.rangeValue.start && !this.rangeValue.end) {
        this.errorStartDate = 'error';
        this.errorEndDate = 'error';
        return;
      }
      if (!this.rangeValue.start) {
        this.errorStartDate = 'error';
        return;
      }
      if (!this.rangeValue.end) {
        this.errorEndDate = 'error';
        return;
      }

      // start date
      const yearStart = this.rangeValue.start.getFullYear();
      const monthStart = String(this.rangeValue.start.getMonth() + 1).padStart(2, '0');
      const dayStart = String(this.rangeValue.start.getDate()).padStart(2, '0');
      // end date
      const yearEnd = this.rangeValue.end.getFullYear();
      const monthEnd = String(this.rangeValue.end.getMonth() + 1).padStart(2, '0');
      const dayEnd = String(this.rangeValue.end.getDate()).padStart(2, '0');

      const range = {
        from: `${yearStart}-${monthStart}-${dayStart}`,
        to:`${yearEnd}-${monthEnd}-${dayEnd}`
      }
      this.searchChange.emit({ mode: this.mode, value: range });
    }
    else
      this.searchChange.emit({ mode: this.mode, value: this.value });

    const nativeEl = this.accordionGroup;
    nativeEl.value = undefined;
  }
}
