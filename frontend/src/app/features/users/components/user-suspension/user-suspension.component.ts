import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import {FormMessage} from "../../../../shared/interfaces/form-message.interface"

@Component({
  selector: 'user-suspension-component',
  templateUrl: './user-suspension.component.html',
  styleUrls: ['./user-suspension.component.scss'],
  standalone:false
})

export class UserSuspensionComponent {
  

   
  @ViewChild('btnClose') btnClose!: ElementRef;  

   @Input() username: string | null | undefined;
   @Input() origin: string | null | undefined;
   @Input() suspend: boolean | null | undefined;
   @Input() formMessage: FormMessage | null | undefined;
   
   @Output() suspensionUserEvent = new EventEmitter<void>();


   

  constructor() { }

    suspensionUser() {

     this.suspensionUserEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
   
  }
  


}