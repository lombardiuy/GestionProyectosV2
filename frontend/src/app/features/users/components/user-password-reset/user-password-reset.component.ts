import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';


@Component({
  selector: 'user-password-reset-component',
  templateUrl: './user-password-reset.component.html',
  styleUrls: ['./user-password-reset.component.scss'],
  standalone:false
})



export class UserPasswordResetComponent {

   @Input() username: string | null | undefined;
   @Output() resetPasswordEvent = new EventEmitter<void>();
   @ViewChild('btnClose') btnClose!: ElementRef;  

  constructor() { }

    resetPassword() {

     this.resetPasswordEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
  }
  


}