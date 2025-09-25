import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { FormGroup } from '@angular/forms';
import { compareRoles } from '../../helpers/compare-roles.helper.';


@Component({
  selector: 'user-create-component',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
  standalone:false
})



export class UsersCreateComponent implements OnInit {

   @Input() profilePicturePath!: string | null;
   @Input() selectedUser!: User| null;
   @Input() userCreateForm!: FormGroup;

   @Input() profilePicture!: File | null;
   @Input() profilePictureStatus:string | null | undefined;
   @Input() imagePreview: string | null | undefined;

   @Input() formError: boolean | undefined;
   @Input() formErrorMsg: string | null | undefined;
   @Input() submitted: boolean | undefined;

    @Input() userRoles!: User[] | null;

    compareRoles = compareRoles;



  constructor() { }


  ngOnInit(): void {


  
  
  }
  

    get form() {
    return this.userCreateForm.controls;
  }

  get name() {
  return this.userCreateForm.get('name');
  }
  get username() {
  return this.userCreateForm.get('username');
  }

get password() {
  return this.userCreateForm.get('password');
}

  get userRole() {
  return this.userCreateForm.get('userRole');
  }
 

   get status() {
  return this.userCreateForm.get('status');
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
    this.userCreateForm.get('profilePicture')?.setValue(true);
      this.imagePreview = URL.createObjectURL(file);


      
    }else {


      this.profilePictureStatus = "El archivo proporcionado no tiene el formato correcto";
      this.imagePreview = "";
      this.profilePicture = null;
      this.userCreateForm.get('profilePicture')?.setValue(false);


    }

  }

   createUsername() {

  

    if (this.userCreateForm.value.name) {
     

    let words = this.userCreateForm.value.name.split(' ');
    let length = words.filter((element: string)=> element!= "").length

    if (length > 1) {
      this.userCreateForm.get('username')?.setValue(words[0].charAt(0).toLowerCase() + words[1].toLowerCase());
 
    }else {
      this.userCreateForm.get('username')?.setValue("");
    }
  }
  }





    ngOnDestroy(): void {
 
  }

}