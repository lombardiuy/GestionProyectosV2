import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {FormMessage} from '../../../../shared/interfaces/form-message.interface';



@Component({
  selector: 'login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone:false
})



export class LoginComponent  {

     @Input() loginForm!: FormGroup;
     @Input() formMessage:FormMessage | null |undefined;
     @Input() loading!: boolean;
     @Input() saving!: boolean;
     @Output() loginEvent = new EventEmitter<void>();


  constructor() {}

  get username() {
  return this.loginForm.get('username');
}

get password() {
  return this.loginForm.get('password');
}


  login() {
    this.loginEvent.emit()
  }

 

}