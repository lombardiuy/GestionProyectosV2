import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { ModalService } from '../../../../shared/services/modal.service';
import {FormMessage} from "../../../../shared/interfaces/form-message.interface"


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
   @Input() hasPermission!: (code: string) => boolean;
   @Input() formMessage: FormMessage | null | undefined;

  constructor(private modalService:ModalService) { }

    resetPassword() {

     this.resetPasswordEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
       this.modalService.switch('userPasswordResetModal', 'createUserModal');
  }
  


}