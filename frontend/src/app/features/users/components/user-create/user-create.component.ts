import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { FormGroup } from '@angular/forms';
import { compareRoles } from '../../helpers/compare-roles.helper.';
import { UserRole } from '../../interfaces/user-role.interface';
import { UserStatus } from '../../interfaces/user-status.enum';
import { createUsername } from '../../helpers/create-username.helper';

@Component({
  selector: 'user-create-component',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
  standalone:false
})



export class UserCreateComponent implements OnInit {

   public userStatus = UserStatus
  
   public compareRoles = compareRoles;


   @Input() profilePicturePath!: string | null;
   @Input() usersList!: User[] | null;
   @Input() userRolesList!: UserRole[] | null;
   @Input() userCreateForm!: FormGroup;
   @Input() formError: boolean | undefined;
   @Input() formErrorMsg: string | null | undefined;
   @Input() submitted: boolean | undefined;
   @Input() imagePreview: string | null | undefined;

   @Output() resetPasswordEvent = new EventEmitter<any>();
   @Output() changeUserStatusEvent = new EventEmitter<any>();
   @Output() saveUserEvent = new EventEmitter<File | null>();

   profilePicture!: File | null;
   profilePictureStatus:string | null | undefined;
  

    @ViewChild('btnClose') btnClose!: ElementRef;  

   

  



  constructor() { }


  ngOnInit(): void {




  
  
  }

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
 

   get status() {
  return this.userCreateForm?.get('status');
  }


  setprofilePicture (event:Event) {

    const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    console.warn('No se seleccionó ningún archivo');
    return;
  }

  

    if (file?.type == "image/jpeg" ||file?.type == "image/jpg" || file?.type == "image/png" ) {


    this.profilePicture = file;
    this.profilePictureStatus = '';
    this.userCreateForm.get('hasProfilePicture')?.setValue(true);
      this.imagePreview = URL.createObjectURL(file);


      
    }else {


      this.profilePictureStatus = "El archivo proporcionado no tiene el formato correcto";
      this.imagePreview = "";
      this.profilePicture = null;
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


  resetPassword() {
    


     this.resetPasswordEvent.emit('resetPassword');
  
  
    


  }

  changeUserStatus() {

      this.changeUserStatusEvent.emit('changeStatus');

  }

  saveUser() {

      this.saveUserEvent.emit(this.profilePicture);

  }



    ngOnDestroy(): void {
 
  }

}