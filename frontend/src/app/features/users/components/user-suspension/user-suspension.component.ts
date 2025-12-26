import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import {FormMessage} from "../../../../shared/interfaces/form-message.interface"
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'user-suspension-component',
  templateUrl: './user-suspension.component.html',
  styleUrls: ['./user-suspension.component.scss'],
  standalone:false
})

export class UserSuspensionComponent {
  

   
  @ViewChild('btnClose') btnClose!: ElementRef;  

   @Input() username: string | null | undefined;
   @Input() suspensionOrigin: string | null | undefined;
   @Input() suspend: boolean | null | undefined;
    @Input() saving!:boolean | null;
   @Input() formMessage: FormMessage | null | undefined;
   @Input() hasPermission!: (code: string) => boolean;
   
   @Output() suspensionUserEvent = new EventEmitter<void>();


   

  constructor(private modalService:ModalService) { }

    suspensionUser() {

     this.suspensionUserEvent.emit();
  
  }

    closeModal() {

      if (this.suspensionOrigin === 'PANEL') {
          this.modalService.switch('userSuspensionModal', 'createUserModal');

      }else {
    this.btnClose.nativeElement.click();
      }
   
  }

  
  


}