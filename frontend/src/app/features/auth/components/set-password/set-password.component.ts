import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {FormMessage} from '../../../../shared/interfaces/form-message.interface';

@Component({
  selector: 'set-password-component',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  standalone:false
})



export class SetPasswordComponent  {

  @Input() setUserPasswordForm!: FormGroup;
  @Input() saving!: boolean;
  @Input() formMessage:FormMessage | null |undefined;


  @Output() setUserPasswordEvent = new EventEmitter<void>();

  constructor() { 
    
   
  
  }

    get username() {
     return this.setUserPasswordForm.get('username');
    }

  get password() {
  return this.setUserPasswordForm.get('password');
  }


get passwordRepeat() {
  return this.setUserPasswordForm.get('passwordRepeat');
}
 
  setUserPassword() {

    this.setUserPasswordEvent.emit();

  }

}