import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import {FormMessage} from "../../../../../shared/interfaces/form-message.interface"
import { FactoryRoute } from '../../../interfaces/factory-route.interface';

@Component({
  selector: 'factory-route-suspension-component',
  templateUrl: './factory-route-suspension.component.html',
  styleUrls: ['./factory-route-suspension.component.scss'],
  standalone:false
})

export class FactoryRouteSuspensionComponent {
  

   
  @ViewChild('btnClose') btnClose!: ElementRef;  

   @Input() factoryRouteToSuspend: Partial<FactoryRoute> | null | undefined;
   @Input() factoryRouteSuspend: boolean | null | undefined;
   @Input() formMessage: FormMessage | null | undefined;
   @Input() hasPermission!: (code: string) => boolean;
   @Input() savingSuspensionFactoryRoute:boolean | undefined;
   
   @Output() suspensionFactoryRouteEvent = new EventEmitter<void>();


   

  constructor() { }

    suspensionFactoryRoute() {

     this.suspensionFactoryRouteEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
   
  }
  


}