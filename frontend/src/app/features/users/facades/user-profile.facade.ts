import { Injectable } from "@angular/core";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { FormBuilder, FormGroup } from "@angular/forms";

import { delay } from "../../../shared/helpers/delay.helper";
import { FormMessage, MessageType } from "../../../shared/interfaces/form-message.interface";

import { AuthService } from "../../../core/services/auth.service";
import { TimeService } from "../../../shared/services/time.service";
import { MessageService } from "../../../shared/services/message.service";

import { validPasswordValidator } from "../validators/valid-password.validator";
import { passwordsMatchValidator } from "../validators/match-password.validator";

import { UpdateUserProfileUseCase } from "../use-cases/update-user-profile.usecase";
import { UploadUserProfilePictureUseCase } from "../use-cases/upload-user-profile-picture.usecase";

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
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }],
      userRole: [{ value: '', disabled: true }],
      actualPassword: [{ value: '', disabled: true }],
      newPassword: [{ value: '', disabled: true }],
      newPasswordRepeat: [{ value: '', disabled: true }],
      profilePicture: [{ value: null, disabled: true }]
    }, {
      validators: [passwordsMatchValidator('newPassword', 'newPasswordRepeat')]
    });
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
      profilePicture: user.profilePicture
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
}


  private resetProfileForm() {

  // Reset completo del formulario
  this.form.reset({
    id: null,
    name: '',
    username: '',
    userRole: '',
    actualPassword: '',
    newPassword: '',
    newPasswordRepeat: '',
    profilePicture: ''
  });

  // Deshabilitar nuevamente password
  ['actualPassword', 'newPassword', 'newPasswordRepeat'].forEach(c => {
    this.form.get(c)?.disable();
    this.form.get(c)?.clearValidators();
    this.form.get(c)?.updateValueAndValidity({ emitEvent: false });
  });

  this.form.markAsPristine();
  this.form.markAsUntouched();

  this.profilePicture = null;
  this.imagePreview = null;
  this.profilePictureStatus$.next(null);
}


  enablePasswordChange() {
    ['actualPassword', 'newPassword', 'newPasswordRepeat'].forEach(c => {
      this.form.get(c)?.enable();
      this.form.get(c)?.setValidators(validPasswordValidator(6));
      this.form.get(c)?.updateValueAndValidity();
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
      await delay(1000);
      this.formMessage$.next(null);
       

      await this.initProfile();
    }
  }
}
