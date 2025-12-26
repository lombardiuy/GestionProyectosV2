import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

import { FormBuilder, FormGroup } from "@angular/forms";

import { delay } from "../../../shared/helpers/delay.helper";

import { createUserForm } from "../forms/user-create.form";


import {FormMessage, MessageType} from "../../../shared/interfaces/form-message.interface";
import {User} from "../interfaces/user.interface";
import {UserRole} from "../interfaces/userRole.interface";



import { UserService } from "../services/user.service";
import { UserRoleService } from "../services/userRole.service";
import { TimeService } from "../../../shared/services/time.service";
import { MessageService } from "../../../shared/services/message.service";
import { CreateUserUseCase } from "../use-cases/create-user.usecase";
import { UpdateUserUseCase } from "../use-cases/update-user.usecase";
import { ResetPasswordUseCase } from "../use-cases/reset-password.usecase";
import { SuspendUserUseCase } from "../use-cases/suspend-user.usecase";




@Injectable()
export class UsersPanelFacade {


  public profilePicturePath = environment.publicURL+'users/';

  public loading$ = new BehaviorSubject(true);
  public saving$ = new BehaviorSubject(false);
  public formMessage$ = new BehaviorSubject<FormMessage | null>(null);
  public profilePictureStatus$ = new BehaviorSubject<string | null>(null);
  public timestamp$: Observable<number>;
  public userList$: Observable<User[] | null>;
  public userRoleList$: Observable<UserRole[] | null>; 

  public form: FormGroup;
  public imagePreview: string | null = null;
  public profilePicture: File | undefined = undefined;
  
  public suspend: boolean | undefined;
  public suspensionOrigin:string | null | undefined;



  constructor(

    private formbuilder:FormBuilder,
    private userService:UserService,
    private userRoleService:UserRoleService,
    private timeService:TimeService,
    private messageService:MessageService,

    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase,
    private suspendUserUseCase: SuspendUserUseCase


  ) {

    this.timestamp$  = this.timeService.timestamp$;
    this.userList$ = this.userService.usersList$;
    this.userRoleList$ = this.userRoleService.userRolesList$;

    
    this.form = createUserForm(this.formbuilder);


  }


   async initPanel() {
    this.loading$.next(true);
    await Promise.all([
      this.userService.getAllUsers(),
      this.userRoleService.getAllUserRoles()
    ]);
    this.loading$.next(false);
  }


   async initForm(user?: any) {

    this.timeService.refreshTimestamp();


    this.form.reset({
      id: null,
      name: '',
      username: '',
      password: environment.default_password,
      profilePicture: null,
      userRole: null,
      active: false,
      suspended: false
    });
    this.imagePreview = null;
   
    
    if (user) {
     
      this.form.patchValue(user);
      const timestamp = await firstValueFrom(this.timestamp$);
      if (user.profilePicture) {
        this.imagePreview = `${environment.publicURL}users/user_${user.id}/ProfilePic_${user.id}.jpeg?t=${timestamp}`;
      }
    }
    this.suspend = !this.form.get('suspended')?.value;
  }





  setProfilePicture(file: File) {

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!validTypes.includes(file.type)) {
    this.profilePictureStatus$.next('El archivo proporcionado no tiene el formato correcto');
       this.imagePreview = URL.createObjectURL(file);
    this.form.get('profilePicture')?.setValue(null);
    return;
  }

  this.profilePicture = file;
  
  const control = this.form.get('profilePicture');

  control?.setValue(Date.now().toString(), { emitEvent: false });
  control?.markAsDirty();      // 🔥 fuerza estado dirty
  control?.markAsTouched();    // opcional, para UX

  this.form.markAsDirty();     // 🔥 el form completo queda dirty
 this.imagePreview = URL.createObjectURL(file);
  this.profilePictureStatus$.next('');
}

  async saveUser() {
    if (this.form.invalid) {
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.ERROR, 'Formulario inválido'));
      return;
    }
    this.saving$.next(true);
    try {
      let savedUser;
      if (this.form.value.id) {
        savedUser = await this.updateUserUseCase.execute(this.form.value, this.profilePicture);
      } else {
        savedUser = await this.createUserUseCase.execute(this.form.value, this.profilePicture);
      }
      this.form.get('id')?.setValue(null);
   
      this.form.get('id')?.setValue(savedUser.user.id)
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.SUCCESS, 'Usuario guardado con éxito'));
     
      await this.userService.getAllUsers();
      this.timeService.refreshTimestamp();
    
     
    } catch (err: any) {
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.ERROR, err.error?.error || 'Error'));
    } finally {

      this.saving$.next(false);
   
      await delay(1000);
      this.formMessage$.next(null)
    }
  }

  async resetPassword() {
    this.saving$.next(true);
 
     let res;
   
    try {
      res = await this.resetPasswordUseCase.execute(this.form.value);
      this.form.get('password')?.setValue(environment.default_password);
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.SUCCESS, 'Contraseña reseteada con éxito'));
      await this.userService.getAllUsers();
    } catch (err: any) {
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.ERROR, err.error?.error || 'Error'));
    } finally {
        await delay(1000);
      this.formMessage$.next(null)
      this.saving$.next(false);
           this.form.get('active')?.setValue(res.user.active);
    }
  }

  async suspensionUser(event:any) {
    this.saving$.next(true);
    let res;
   
    try {
       res = await this.suspendUserUseCase.execute(this.form.value);
    
      const msg = res.user.suspended ? 'Usuario suspendido' : 'Usuario reactivado';
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.SUCCESS, msg));
      await this.userService.getAllUsers();
    } catch (err: any) {
      this.formMessage$.next(this.messageService.createFormMessage(MessageType.ERROR, err.error?.error || 'Error'));
    } finally {

      await delay(1000);
      this.formMessage$.next(null)
      this.saving$.next(false);
      this.form.get('suspended')?.setValue(res.user.suspended);
      this.suspend = !res.user.suspended;
    }
  }

  

async destroyPanel() {
  
    await this.userService.clearSelectedUser();
    await this.userService.clearUserList();
    await this.userRoleService.clearUserRoleList();



}



  }

