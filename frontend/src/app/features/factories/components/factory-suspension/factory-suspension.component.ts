import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import {FormMessage} from "../../../../shared/interfaces/form-message.interface"
import { FactoryRoute } from '../../interfaces/factory-route.interface';

@Component({
  selector: 'factory-suspension-component',
  templateUrl: './factory-suspension.component.html',
  styleUrls: ['./factory-suspension.component.scss'],
  standalone:false
})

export class FactorySuspensionComponent {
  

   
  @ViewChild('btnClose') btnClose!: ElementRef;  

   @Input() factoryToSuspend: Partial<FactoryRoute> | null | undefined;
   @Input() factorySuspend: boolean | null | undefined;
   @Input() formMessage: FormMessage | null | undefined;
   @Input() hasPermission!: (code: string) => boolean;
   @Input() savingSuspensionFactory:boolean | undefined;
   
   @Output() suspensionFactoryEvent = new EventEmitter<void>();


   

  constructor() { }

    suspensionFactory() {

     this.suspensionFactoryEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
   
  }
  


}