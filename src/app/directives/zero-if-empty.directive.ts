import { Directive, ElementRef, HostListener } from '@angular/core';
import { IonInput } from '@ionic/angular';

@Directive({
  selector: '[appZeroIfEmpty]',
  standalone: true,
})
export class ZeroIfEmptyDirective {
  constructor(private readonly el: ElementRef<IonInput>) {}

  @HostListener('ionBlur')
  async onBlur() {
    const ionInput = this.el.nativeElement as any;
    const inputEl = await ionInput.getInputElement();
    const value = inputEl.value?.toString().trim();

    if (!value) {
      ionInput.value = 0;
      inputEl.value = '0';

      ionInput.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 0 } }));
      ionInput.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 0 } }));
    }
  }
}
