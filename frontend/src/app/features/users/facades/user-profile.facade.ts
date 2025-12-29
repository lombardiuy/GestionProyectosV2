import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { delay } from "../../../shared/helpers/delay.helper";
import { FormMessage, MessageType } from "../../../shared/interfaces/form-message.interface";

import { AuthService } from "../../../core/services/auth.service";
import { TimeService } from "../../../shared/services/time.service";
import { MessageService } from "../../../shared/services/message.service";

import { validPasswordValidator } from "../validators/valid-password.validator";
import { passwordsMatchValidator } from "../validators/match-password.validator";


import { UpdateUserProfileUseCase } from "../use-cases/update-user-profile.usecase";
import { UploadUserProfilePictureUseCase } from "../use-cases/upload-user-profile-picture.usecase";
import { createUserProfileForm } from "../forms/user-profile.form";



@Injectable()
export class UserProfileFacade {

  public profilePicturePath = environment.publicURL + 'users/';

  public loading$ = new BehaviorSubject(true);
  public saving$  = new BehaviorSubject(false);
  public formMessage$ = new BehaviorSubject<FormMessage | null>(null);
  public profilePictureStatus$ = new BehaviorSubject<string | null>(null);
  public timestamp$: Observable<number>;

  public form: FormGroup;
  public imagePreview: string | null = null;
  public profilePicture: File | null = null;
      

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private timeService: TimeService,
    private messageService: MessageService,

    private updateUserProfileUseCase: UpdateUserProfileUseCase,
    private uploadUserProfilePictureUseCase: UploadUserProfilePictureUseCase
  ) {
    this.timestamp$ = this.timeService.timestamp$;
  
     this.form = createUserProfileForm(this.fb);
  }



  
async initProfile() {

  this.loading$.next(true);
  

  this.resetProfileForm();


  const user = await firstValueFrom(this.authService.userProfile$);

  if (user) {

    this.form.patchValue({
      id: user.id,
      name: user.name,
      username: user.username,
      userRole: user.userRole.name,

    });

    if (user.profilePicture) {
      const timestamp = await firstValueFrom(this.timestamp$);
      this.imagePreview = `${environment.publicURL}users/user_${user.id}/ProfilePic_${user.id}.jpeg?t=${timestamp}`;
    }
  }

  this.form.markAsPristine();
  this.form.markAsUntouched();

  this.timeService.refreshTimestamp();
  this.loading$.next(false);

  console.log(this.form)
}


 private resetProfileForm() {
  this.form.reset({
    id: null,
    name: null,
    username: null,
    userRole: null,
    actualPassword: null,
    newPassword: null,
    newPasswordRepeat: null,
    profilePicture: null
  });

  // Deshabilitar los campos de password y quitar validadores
  ['actualPassword', 'newPassword', 'newPasswordRepeat'].forEach(c => {
    const ctrl = this.form.get(c);
    ctrl?.disable();
    ctrl?.clearValidators();
    ctrl?.updateValueAndValidity({ emitEvent: false });
  });

  this.form.markAsPristine();
  this.form.markAsUntouched();

  this.profilePicture = null;
  this.imagePreview = null;
  this.profilePictureStatus$.next(null);
}


enablePasswordChange() {
  ['actualPassword', 'newPassword', 'newPasswordRepeat'].forEach(c => {
    const ctrl = this.form.get(c);
    ctrl?.enable(); // habilita
    ctrl?.setValidators([Validators.required]); // required
    ctrl?.updateValueAndValidity(); // recalcula validez
    ctrl?.markAsTouched(); // para que el error se vea inmediatamente
  });
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
     this.form.get('profilePicture')?.setValue(Date.now().toString());
     this.form.get('profilePicture')?.markAsDirty();



 this.imagePreview = URL.createObjectURL(file);
  this.profilePictureStatus$.next('');
}


  async saveProfile() {
  
    if (this.form.invalid) {
      this.formMessage$.next(
        this.messageService.createFormMessage(MessageType.ERROR, 'Formulario inválido')
      );
      return;
    }

    this.saving$.next(true);

    try {
      const res = await this.updateUserProfileUseCase.execute({
        id: this.form.value.id,
        actualPassword: this.form.getRawValue().actualPassword,
        newPassword: this.form.getRawValue().newPassword,
        profilePicture: this.form.getRawValue().profilePicture
      });

      if (this.profilePicture) {
        await this.uploadUserProfilePictureUseCase.execute(res.user.id, this.profilePicture);
      }

      this.formMessage$.next(
        this.messageService.createFormMessage(MessageType.SUCCESS, 'Perfil actualizado con éxito')
      );
   
   

    } catch (err: any) {
      this.formMessage$.next(
        this.messageService.createFormMessage(MessageType.ERROR, err.error?.error || 'Error')
      );
    } finally {
      this.saving$.next(false);
       this.timeService.refreshTimestamp();
      await delay(1000);
      this.formMessage$.next(null);
       

      await this.initProfile();
    }
  }
}
