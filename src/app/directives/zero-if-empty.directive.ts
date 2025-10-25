import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appZeroIfEmpty]',
  standalone: false,
})
export class ZeroIfEmptyDirective {
  constructor(private readonly ngControl: NgControl) {}

  private setControlValue(val: number) {
    const control = this.ngControl.control;
    if (!control) return;
    // only update if different to avoid needless events
    if (control.value !== val) {
      control.setValue(val, { emitEvent: false });
      control.markAsDirty();
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  @HostListener('ionBlur')
  onBlur() {
    const control = this.ngControl.control;
    if (!control) return;
    const v = control.value;
    // treat '', null, undefined as empty -> set 0
    if (v === '' || v === null || v === undefined) {
      this.setControlValue(0);
    }
  }

  @HostListener('ionInput')
  onInput(event: any) {console.log('ionInput', event)
    const raw = event?.detail?.value ?? event?.target?.value;
    if (raw === '' || raw === null || raw === undefined) {
      // don't immediately force 0 on every keystroke; only if empty string
      this.setControlValue(0);
      return;
    }

    // Allow numeric strings like '12' or numbers.
    const num = Number(raw);
    if (!isNaN(num)) {
      if (num < 0) {
        // convert negative to positive
        this.setControlValue(Math.abs(num));
      }
      // else keep user input (do not override on every keystroke)
    } else {
      // non-numeric input: clear to 0 (optional)
      // this.setControlValue(0);
    }
  }
}
