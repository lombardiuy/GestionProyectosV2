import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FormMessage, MessageType } from '../../../../shared/interfaces/form-message.interface';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { passwordsMatchValidator } from '../../validators/match-password.validator';
import { validPasswordValidator } from '../../validators/valid-password.validator';
import { MessageService } from '../../../../shared/services/message.service';
import { UserService } from '../../services/user.service';
import { FileService } from '../../../../core/services/file.service';
import { TimeService } from '../../../../shared/services/time.service';
import { delay } from '../../../../shared/helpers/delay.helper';



@Component({
  selector: 'user-profile-page',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone:false
})



export class UserProfilePage implements OnInit{

  
      public loading:boolean = true;
      public saving:boolean = false;
      
  
    //General
  
  
    public profilePicturePath =  environment.publicURL+'users/profilePic/';
  
    

  
    //CREAR/EDITAR USUARIOS
    private updateUserProfileSubscription?: Subscription;
    public userProfileForm!: FormGroup;

    
   
    public imagePreview: string | null | undefined;
    public profilePicture!: File | null;
    public profilePictureStatus:string | null | undefined;;
    public formMessage:FormMessage | null |undefined;


  



  constructor(
    private authService:AuthService,
    private messageService:MessageService,
    private userService:UserService,
     private formBuilder:FormBuilder, 
    private fileService:FileService, 
    private timeService:TimeService) { }


  ngOnInit() {

    this.initForm();
    this.loading = false;
    
  }

  get form() {
    return this.userProfileForm.controls;
  }


    get id() {
  return this.userProfileForm.get('id');
}

  get actualPassword() {
  return this.userProfileForm.get('actualPassword');
}

  get hasProfilePicture() {
  return this.userProfileForm.get('hasProfilePicture');
}



  get newPassword() {
  return this.userProfileForm.get('newPassword');
}

  get newPasswordRepeat() {
  return this.userProfileForm.get('newPasswordRepeat');
}





  setprofilePicture (event:Event) {

    const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    console.warn('No se seleccionó ningún archivo');
    return;
  }

  

    if (file?.type == "image/jpeg" ||file?.type == "image/jpg" || file?.type == "image/png" ) {




    this.profilePictureStatus = '';
    this.userProfileForm.get('hasProfilePicture')?.setValue(true);
    this.profilePicture = file
    this.imagePreview = URL.createObjectURL(file);
    this.userProfileForm.markAsDirty();
    

  

   
    }else {


      this.profilePictureStatus = "El archivo proporcionado no tiene el formato correcto";
      this.imagePreview = "";
      this.userProfileForm.get('profilePicture')?.setValue(false);


    }

  }

 
createEmptyForm() {
   this.formMessage = null;
  this.userProfileForm = this.formBuilder.group(
    {
      id: [{ value: null, disabled: true }],
      name: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }],
      actualPassword:  [{ value: '', disabled: true }],
      newPassword:  [{ value: '', disabled: true }],
      newPasswordRepeat: [{ value: '', disabled: true }],
      hasProfilePicture: [{ value: null, disabled: true }],
      userRole: [{ value: '', disabled: true }],
      active: [{ value: null, disabled: true }],
      suspended: [{ value: null, disabled: true }]
    },
    {
      validators: [passwordsMatchValidator('newPassword', 'newPasswordRepeat')]
    }
  );
}





 async initForm() {

  this.createEmptyForm();

    const selectedUser = await firstValueFrom(this.authService.userProfile$);


  if (selectedUser) {
    
    this.form['id'].setValue(selectedUser.id);
    this.form['name'].setValue(selectedUser.name);
    this.form['username'].setValue(selectedUser.username);
    this.form['userRole'].setValue(selectedUser.userRole.name);
    this.form['hasProfilePicture'].setValue(selectedUser.hasProfilePicture);


    if (selectedUser.hasProfilePicture) {
       this.imagePreview = this.profilePicturePath+"ProfilePic_"+selectedUser.id+".jpeg";
        
    }


  }
  
  
}


changePassword() {
this.form['actualPassword'].enable();
this.form['actualPassword'].setValidators([Validators.required, validPasswordValidator(6)]);
this.form['actualPassword'].updateValueAndValidity();

this.form['newPassword'].enable();
this.form['newPassword'].setValidators([Validators.required, validPasswordValidator(6)]);
this.form['newPassword'].updateValueAndValidity();

this.form['newPasswordRepeat'].enable();
this.form['newPasswordRepeat'].setValidators([Validators.required, validPasswordValidator(6)]);
this.form['newPasswordRepeat'].updateValueAndValidity();

}


  updateUserProfile() {


    
          if (this.userProfileForm.invalid) {
    
    
          this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,'Por favor, completa todos los campos correctamente.' )
          return;
        }
    
        this.saving = true;
    
        this.updateUserProfileSubscription = this.userService.updateUserProfile(
          this.id?.value,
          this.actualPassword?.value,
           this.newPassword?.value,
            this.hasProfilePicture?.value
         
        ).subscribe({
          next: async(res) => {
    
            if(this.profilePicture) {
         
        
              await this.fileService.save(this.profilePicture, 'ProfilePic_'+res.userID, 'profilePic')
            }
       
    
    
            this.formMessage = this.messageService.createFormMessage(MessageType.SUCCESS,'Usuario actualizado con éxito!' )
            this.saving = false;
         
            
            await delay(1000);
            await this.userService.getAllUsers();
            this.timeService.refreshTimestamp();
           
               this.initForm();
    

    
             
        
           
          },
          error: async (err) => {
            console.error(err)
     
         
            this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,err.error.error )
            this.saving = false;
            await delay(1000)
            this.formMessage = null;
          }
        });
     


  }
    ngOnDestroy(): void {
 
  }

}