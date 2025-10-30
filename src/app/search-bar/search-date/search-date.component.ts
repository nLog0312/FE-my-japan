import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-date',
  templateUrl: './search-date.component.html',
  styleUrls: ['./search-date.component.scss'],
  standalone: false,
})
export class SearchDateComponent {
  @Output() searchChange = new EventEmitter<any>();

  mode: 'year' | 'month' | 'day' | 'range' = 'month';
  rangeValue: { start?: string; end?: string } = {};

  onModeChange() {
    this.rangeValue = {};
    this.searchChange.emit({ mode: this.mode, value: null });
  }

  emitValue(event: any) {
    if (event.detail.value) {
      const value = event.detail.value;
      this.searchChange.emit({ mode: this.mode, value });
    }
  }

  emitRangeChange(event: any) {
    const value = event.detail.value || {};
    this.rangeValue = value;
    if (value.start && value.end) {
      this.searchChange.emit({ mode: this.mode, value });
    }
  }

  reset() {
    this.rangeValue = {};
    this.searchChange.emit({ mode: this.mode, value: null, reset: true });
  }
}
