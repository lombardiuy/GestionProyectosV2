import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {UserRole} from '../../interfaces/userRole.interface';
import { FormMessage} from '../../../../shared/interfaces/form-message.interface';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'user-role-create-component',
  templateUrl: './user-role-create.component.html',
  styleUrls: ['./user-role-create.component.scss'],
  standalone:false
})



export class UserRoleCreateComponent {

     @Input() userRoleCreateForm!: FormGroup ;
     @Input() selectedUserRole:UserRole | null | undefined;
     @Input() modules:any;
     @Input() saving:boolean | null | undefined;
     @Input() loading:boolean | null | undefined;
     @Input() formMode:string | null | undefined;
     @Input() formMessage:FormMessage | null |undefined;

     @Output() saveUserRoleEvent = new EventEmitter<void>();

  constructor(private authService:AuthService) {

  }

  saveUserRole() {
    this.saveUserRoleEvent.emit()
  }

   hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

}