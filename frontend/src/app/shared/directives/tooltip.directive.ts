import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { Tooltip } from 'bootstrap';

@Directive({
  selector: '[Tooltip]',
  standalone:false
})
export class TooltipDirective implements AfterViewInit, OnDestroy {

  @Input('Tooltip') tooltipText!: string;
  @Input() tooltipPlacement: string = 'bottom';
  @Input() tooltipClass: string = '';

  private tooltipInstance!: Tooltip;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const native = this.el.nativeElement;

    native.setAttribute('title', this.tooltipText);
    native.setAttribute('data-bs-toggle', 'tooltip');
    native.setAttribute('data-bs-placement', this.tooltipPlacement);

    this.tooltipInstance = new Tooltip(native, {
      customClass: this.tooltipClass
    });
    
  }

  ngOnDestroy() {
    if (this.tooltipInstance) {
      this.tooltipInstance.dispose();
    }
  }
}
