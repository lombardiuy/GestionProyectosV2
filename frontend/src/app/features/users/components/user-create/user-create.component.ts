import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { FormGroup } from '@angular/forms';
import { compareRoles } from '../../helpers/compare-roles.helper.';
import { UserRole } from '../../interfaces/userRole.interface';
import { createUsername } from '../../helpers/create-username.helper';
import { FormMessage } from '../../../../shared/interfaces/form-message.interface';

@Component({
  selector: 'user-create-component',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
  standalone:false
})



export class UserCreateComponent {

  
   public compareRoles = compareRoles;


   @Input() profilePicturePath!: string | null;
   @Input() usersList!: User[] | null;
   @Input() userRolesList!: UserRole[] | null;

   @Input() userCreateForm!: FormGroup;
   @Input() formMessage: FormMessage | null | undefined;
   @Input() submitted: boolean | undefined;
   @Input() imagePreview: string | null | undefined;
   @Input() profilePictureStatus:string | null | undefined;

   @Output() resetPasswordEvent = new EventEmitter<void>();
   @Output() changeUserStatusEvent = new EventEmitter<void>();
   @Output() saveUserEvent = new EventEmitter<void>();
   @Output() setProfilePictureEvent = new EventEmitter<File>();
  

  @ViewChild('btnClose') btnClose!: ElementRef;  

   

  



  constructor() { }



  closeModal() {
    this.btnClose.nativeElement.click();
  }
  
  

  get form() {
    return this.userCreateForm?.controls;
  }

  get id() {
  return this.userCreateForm?.get('id');
  }

  get name() {
  return this.userCreateForm?.get('name');
  }
  get username() {
  return this.userCreateForm?.get('username');
  }

  get password() {
  return this.userCreateForm?.get('password');
}

  get userRole() {
  return this.userCreateForm?.get('userRole');
  }
 

  get active() {
  return this.userCreateForm?.get('active');
  }

  get suspended() {
  return this.userCreateForm?.get('suspended');
  }



  setprofilePicture (event:Event) {

    const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    console.warn('No se seleccionó ningún archivo');
    return;
  }

  

    if (file?.type == "image/jpeg" ||file?.type == "image/jpg" || file?.type == "image/png" ) {

     this.setProfilePictureEvent.emit(file);
   
    }else {


      this.profilePictureStatus = "El archivo proporcionado no tiene el formato correcto";
      this.imagePreview = "";
      this.userCreateForm.get('profilePicture')?.setValue(false);


    }

  }

  createUsername() {

    if (!this.id?.value) {

  
  const name = this.userCreateForm.value.name;
  const username = createUsername(name, this.usersList);
  this.userCreateForm.get('username')?.setValue(username);
    }
  }


  saveUser() {

      this.saveUserEvent.emit();

  }



    ngOnDestroy(): void {
 
  }

}