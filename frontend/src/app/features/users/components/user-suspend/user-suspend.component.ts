import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import {FormMessage} from "../../.././../shared/interfaces/form-message.interface"

@Component({
  selector: 'user-suspend-component',
  templateUrl: './user-suspend.component.html',
  styleUrls: ['./user-suspend.component.scss'],
  standalone:false
})



export class UserSuspendComponent {

   
  @ViewChild('btnClose') btnClose!: ElementRef;  

   @Input() username: string | null | undefined;
   @Input() origin: string | null | undefined;
   @Input() formMessage: FormMessage | null | undefined;
   
   @Output() suspendUserEvent = new EventEmitter<void>();


   

  constructor() { }

    suspendUser() {

     this.suspendUserEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
   
  }
  


}