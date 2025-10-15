import {  Component, OnInit, ViewChild } from '@angular/core';
import {  map, Observable,  pipe,  Subscription } from 'rxjs';

import { UserService } from '../../services/user.service';
import { UserRoleService } from '../../services/userRole.service';
import { TimeService } from '../../../../shared/services/time.service';
import { MessageService } from '../../../../shared/services/message.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from '../../../../../environments/environment';

import { validUsername } from '../../validators/valid-username.validator';
import { allowedValuesValidator } from '../../../../shared/validators/custom-validators';

import {User} from "../../interfaces/user.interface";
import { UserRole } from '../../interfaces/userRole.interface';
import { FileService } from '../../../../core/services/file.service';
import { delay } from '../../../../shared/helpers/delay.helper';
import { UserCreateComponent } from '../../components/user-create/user-create.component';
import { UserPasswordResetComponent } from '../../components/user-password-reset/user-password-reset.component';
import { UserSuspensionComponent } from '../../components/user-suspension/user-suspension.component';


import { FormMessage, MessageType } from '../../../../shared/interfaces/form-message.interface';
import { AuthService } from '../../../../core/services/auth.service';

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
   public origin:string | null | undefined;

  //CREAR/EDITAR USUARIOS
    private createUserSubscription?: Subscription;
    private resetUserPasswordSubscription?: Subscription;
    private userSuspendSubscription?: Subscription;
    private userUnsuspendSubscription?: Subscription;

  @ViewChild(UserCreateComponent) userCreateComponent!: UserCreateComponent;
  @ViewChild(UserPasswordResetComponent) userPasswordResetComponent!: UserPasswordResetComponent;
  @ViewChild(UserSuspensionComponent) userSuspensionComponent!: UserSuspensionComponent;


  public userCreateForm!: FormGroup;
  public selectedUser$: Observable<User | null>;
  public userRolesList$:Observable<UserRole[] | null>;
  
 
  public imagePreview: string | null | undefined;
  public profilePicture!: File | null;
  public profilePictureStatus:string | null | undefined;;
  public formMessage:FormMessage | null |undefined;
  public submitted: boolean | undefined;

  public suspend:boolean | undefined;

  
  

  constructor(
    private userService:UserService, 
    private authService:AuthService,
    private userRoleService:UserRoleService,
    private fileService:FileService,  
    private timeService:TimeService,
    private messageService:MessageService, 
    private formBuilder:FormBuilder) {


     this.usersList$ = this.userService.usersList$;
     this.userRolesList$ = this.userRoleService.userRolesList$;
     this.selectedUser$ = this.userService.selectedUser$;
     this.timestamp$ = this.timeService.timestamp$;

     

     
   }

   get form() {
    return this.userCreateForm?.controls;
  }


  



  async ngOnInit(): Promise<void> {

    await this.userService.getAllUsers();
    await this.userRoleService.getAllUserRoles();
    this.createEmptyForm();

   
  
  
  }

 
createEmptyForm() {
    this.userCreateForm = this.formBuilder.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', Validators.required],
      password: [''],
      hasProfilePicture: [null],
      userRole: ['', Validators.required],
      active:[null],
      suspended:[null]
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
    this.form['active'].setValue(selectedUser.active);
    this.form['suspended'].setValue(selectedUser.suspended);
    this.form['hasProfilePicture'].setValue(selectedUser.hasProfilePicture);


    if (selectedUser.hasProfilePicture) {
       this.imagePreview = this.profilePicturePath+"ProfilePic_"+selectedUser.id+".jpeg";
    }

    if (this.form['active'].value === false) {
          this.form['password'].setValue(environment.default_password);
          this.form['password'].setValidators([Validators.required]);
         this.form['password'].updateValueAndValidity();
    }
  }
  
  else {
    // Solo para creación
    this.form['password'].setValue(environment.default_password);
    this.form['password'].setValidators([Validators.required]);
    this.form['password'].updateValueAndValidity();
    this.form['hasProfilePicture'].setValue(false);
    this.form['active'].setValue(false);
    this.form['suspended'].setValue(false);
 
    
  }
  
    this.suspend = !this.form['suspended'].value;
}

  resetForm() {
    this.userCreateForm.reset({
      id: null,
      name: '',
      username: '',
      password: '',
      hasProfilePicture: null,
      userRole: '',
      active:null,
      suspended:null
    
    });
  this.userCreateForm.get('password')?.clearValidators();
  this.userCreateForm.get('password')?.updateValueAndValidity();


  this.formMessage = null;
  this.submitted = false;
  this.imagePreview = "";
  
    this.suspend = undefined;






  }


  async editUser(userID:number) { 
    console.log(userID)

    const selectedUser = await this.userService.selectUser(userID);

    this.initForm(selectedUser)




  
  } 

  async createUser() { 
    
    await this.userService.clearSelectedUser()

    this.initForm();

  
  } 

  resetPassword() {
 
      this.resetUserPasswordSubscription= this.userService.resetUserPassword(
    this.userCreateForm.value
     
    ).subscribe({
      next: async(res) => {

       this.form['active'].setValue(res.user.active);
       this.form['password'].setValue(environment.default_password);
        this.formMessage = this.messageService.createFormMessage(MessageType.SUCCESS,'Contraseña reseteada con éxito!' )

        this.submitted = false;
        
        this.userPasswordResetComponent.closeModal()
        
        await delay(1000);

       this.formMessage = null;
       


        await this.userService.getAllUsers();
        this.timeService.refreshTimestamp();

  


         
    
       
      },
      error: (err) => {
        console.error(err)
 
   

        this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,err.error.error )


        this.submitted = false;
      }
    });



    

  }

   suspensionUser() {


      this.userSuspendSubscription= this.userService.suspensionUser(
    this.userCreateForm.value
     
    ).subscribe({
      next: async(res) => {



  
        this.form['suspended'].setValue(res.user.suspended);
        
  
   
     

          if (res.user.suspended) {
        this.formMessage = this.messageService.createFormMessage(MessageType.SUCCESS,'Usuario suspendido con éxito!' )
          }else  {
             this.formMessage = this.messageService.createFormMessage(MessageType.SUCCESS,'Usuario reactivado con éxito!' )
          }

        this.submitted = false;

       
   
        
        await delay(1000);
        
        this.userSuspensionComponent.closeModal()

        this.formMessage = null;

       


        await this.userService.getAllUsers();
        this.timeService.refreshTimestamp();

        this.origin = null;

        this.suspend = !this.form['suspended'].value;
  


         
    
       
      },
      error: (err) => {
        console.error(err)
        
        this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,err.error.error )
        this.submitted = false;
      }
    });


  }

  




 


  async suspendUserFromList(event:any) { 

    this.editUser(event.id);
    this.suspend = event.suspend;
    this.origin = "LIST";
   







  
  } 




  saveUser(action?:string) {

 

      if (this.userCreateForm.invalid) {


      this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,'Por favor, completa todos los campos correctamente.' )
      return;
    }

    this.submitted = true;

    this.createUserSubscription= this.userService.createUser(
      this.userCreateForm.value,
     
    ).subscribe({
      next: async(res) => {

        if(this.profilePicture) {
     
    
          await this.fileService.save(this.profilePicture, 'ProfilePic_'+res.user.id, 'profilePic')
        }
   


        this.formMessage = this.messageService.createFormMessage(MessageType.SUCCESS,'Usuario guardado con éxito!' )
        this.submitted = false;
        
        await delay(1000);
        await this.userService.getAllUsers();
        this.timeService.refreshTimestamp();

         this.userCreateComponent.closeModal()


         
    
       
      },
      error: (err) => {
        console.error(err)
 
     
        this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,err.error.error )
        this.submitted = false;
      }
    });
 


  

  }

  setprofilePicture (profilePicture:File) {


    this.profilePictureStatus = '';
    this.userCreateForm.get('hasProfilePicture')?.setValue(true);
    this.profilePicture = profilePicture
    this.imagePreview = URL.createObjectURL(profilePicture);
    this.userCreateForm.markAsDirty();
    

  

  }




  hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

  
  async ngOnDestroy() {
    await this.userService.clearSelectedUser();
    await this.userService.clearUserList();
    await this.userRoleService.clearUserRoleList();

    this.createUserSubscription?.unsubscribe();
    this.resetUserPasswordSubscription?.unsubscribe();
    this.userSuspendSubscription?.unsubscribe();
    this.userUnsuspendSubscription?.unsubscribe();
  }


  
}