import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, Observable, Subscription } from 'rxjs';

import { UserService } from '../../services/user.service';

import { TimeService } from '../../../../shared/services/time.service';


import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../../../environments/environment';

import { validUsername } from '../../validators/valid-username.validator';
import { allowedValuesValidator } from '../../../../shared/validators/custom-validators';

import { UserStatus } from '../../interfaces/user-status.enum';
import {User} from "../../interfaces/user.interface";
import { UserRole } from '../../interfaces/user-role.interface';
import { FileService } from '../../../../core/services/file.service';
import { delay } from '../../../../shared/helpers/delay.helper';
import { UserCreateComponent } from '../../components/user-create/user-create.component';

@Component({
  selector: 'users-panel-page',
  templateUrl: './users-panel.page.html',
  styleUrls: ['./users-panel.page.scss'],
  standalone:false
})



export class UsersPanelPage implements OnInit {

  //General


  public profilePicturePath =  environment.publicURL+'users/profilePic/';
  

 //LISTAR USUARIOS

   public timestamp$: Observable<number>;
   public usersList$: Observable<User[] | null>;


  //CREAR/EDITAR USUARIOS
    private createUserSubscription?: Subscription;

  @ViewChild(UserCreateComponent) userCreateComponent!: UserCreateComponent;

  public userCreateForm!: FormGroup;
  public selectedUser$: Observable<User | null>;
  public userRolesList$:Observable<UserRole[] | null>;
 
  public imagePreview: string | null | undefined;
  public formError: boolean | undefined;
  public formErrorMsg: string | null | undefined;
  public submitted: boolean | undefined;
  

  constructor(private userService:UserService, private fileService:FileService,  private timeService:TimeService, private formBuilder:FormBuilder) {


     this.usersList$ = this.userService.usersList$;
     this.userRolesList$ = this.userService.userRolesList$;
     this.selectedUser$ = this.userService.selectedUser$;
     this.timestamp$ = this.timeService.timestamp$;
     

     
   }

   get form() {
    return this.userCreateForm?.controls;
  }


  



  async ngOnInit(): Promise<void> {

    await this.userService.getAllUsers();
    await this.userService.getAllUserRoles();
    this.createEmptyForm();

   
  
  
  }

 
createEmptyForm() {
    this.userCreateForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', Validators.required],
      password: [''],
      hasProfilePicture: [false],
      userRole: ['', Validators.required],
      status: [
        '',
        [Validators.required, allowedValuesValidator([UserStatus.Active, UserStatus.Inactive, UserStatus.Suspended])]
      ]
    }, {
      validator: validUsername('name')
    });
  }
  


initForm(selectedUser?: User | null) {
  this.resetForm();

  if (selectedUser) {
    this.form['id'].setValue(selectedUser.id);
    this.form['name'].setValue(selectedUser.name);
    this.form['username'].setValue(selectedUser.username);
    this.form['userRole'].setValue(selectedUser.userRole);
    this.form['status'].setValue(selectedUser.status);
    this.form['hasProfilePicture'].setValue(selectedUser.hasProfilePicture);

    if (selectedUser.hasProfilePicture) {
       this.imagePreview = this.profilePicturePath+"ProfilePic_"+selectedUser.id+".jpeg";
    }

    if (this.form['status'].value === UserStatus.Inactive) {
          this.form['password'].setValue(environment.default_password);
          this.form['password'].setValidators([Validators.required]);
         this.form['password'].updateValueAndValidity();
    }
  } else {
    // Solo para creación
    this.form['password'].setValue(environment.default_password);
    this.form['password'].setValidators([Validators.required]);
    this.form['password'].updateValueAndValidity();
    
  }
}

  resetForm() {
    this.userCreateForm.reset({
      id: null,
      name: '',
      username: '',
      password: '',
      hasProfilePicture: false,
      userRole: '',
      status: UserStatus.Inactive
    });
  this.userCreateForm.get('password')?.clearValidators();
  this.userCreateForm.get('password')?.updateValueAndValidity();

  this.formError = false;
  this.formErrorMsg = ""
  this.submitted = false;

  }


  async editUser(userID:number) { 

    const selectedUser = await this.userService.selectUser(userID);

    this.initForm(selectedUser)




  
  } 

  async createUser() { 
      await this.userService.clearSelectedUser()

    this.initForm();

  
  } 

  resetPassword() {
     this.form['password']?.setValue(environment.default_password);
    this.form['status'].setValue(UserStatus.Inactive);

  }

  changeUserStatus() {


    if ( this.form['status']?.value === UserStatus.Suspended) {
      this.form['status'].setValue(UserStatus.Inactive);
         this.form['password'].setValue(environment.default_password);
          this.form['password'].setValidators([Validators.required]);
    }else if (this.form['status']?.value === UserStatus.Active) {
      this.form['status'].setValue(UserStatus.Suspended);
    }

  }

  saveUser(profilePicture: File | null) {

    console.log("LLAMADA")

      if (this.userCreateForm.invalid) {
          this.formError = true;
         this.formErrorMsg = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.submitted = true;

    this.createUserSubscription= this.userService.createUser(
      this.userCreateForm.value,
     
    ).subscribe({
      next: async(res) => {

        if(profilePicture) {
     
    
          await this.fileService.save(profilePicture, 'ProfilePic_'+res.user.id, 'profilePic')
        }
   
        this.formError = false;
        this.formErrorMsg = 'Usuario guardado con éxito!';
        this.submitted = false;
        
        await delay(1000);
        await this.userService.getAllUsers();
        this.timeService.refreshTimestamp();

         this.userCreateComponent.closeModal()


         
    
       
      },
      error: (err) => {
        console.error(err)
 
        this.formError = true;
        this.formErrorMsg = err.error.error
        this.submitted = false;
      }
    });
 


  

  }

  
  async ngOnDestroy() {
    await this.userService.clearSelectedUser();
    await this.userService.clearUserList();
    await this.userService.clearUserRoleList();
    this.createUserSubscription?.unsubscribe();
  }


  
}