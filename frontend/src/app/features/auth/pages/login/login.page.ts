import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {FormMessage, MessageType} from '../../../../shared/interfaces/form-message.interface'
import { MessageService } from '../../../../shared/services/message.service';
import { delay } from '../../../../shared/helpers/delay.helper';
import { passwordsMatchValidator } from '../../../users/validators/match-password.validator';
import { UserService } from '../../../users/services/user.service';


@Component({
  selector: 'login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})



export class LoginPage implements OnInit {


  
  public loginForm!: FormGroup;
  public setUserPasswordForm!: FormGroup;

  private loginSubscription?: Subscription;
  private setUserPasswordSubscription?: Subscription;

  usernameInput:string | null = null;
  passwordInput: string | null = null;

  public formMessage:FormMessage | null |undefined;
  public loading: boolean = true;
  public saving!: boolean;

  public setPasswordMode:boolean = false;

  

  constructor(
    private userService:UserService,
    private authService: AuthService,
     private formBuilder: FormBuilder,
      private router:Router,  
       private messageService:MessageService ) { 
    

  
  }

  ngOnInit(): void {

      this.loginForm = this.formBuilder.group(
      {

      username: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(4)]]
    }
    );

    this.setUserPasswordForm = this.formBuilder.group(
    {
      id: ["", [Validators.required]],
      username: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      passwordRepeat: ["", Validators.required],
    },
    {
      validators: passwordsMatchValidator('password', 'passwordRepeat')
    }
  );

  this.loading = false;

  
  }
   

get username() {
  return this.loginForm.get('username');
}

get password() {
  return this.loginForm.get('password');
}



  async login() {


    
         if (this.loginForm.invalid) {

          this.messageService.createFormMessage(MessageType.ERROR, "Por favor, completá todos los campos correctamente.")
          await delay(1000);
          this.formMessage = null;

      return;
    }
  this.saving = true;

   this.loginSubscription = this.authService.login(
      this.loginForm.get('username')!.value,
      this.loginForm.get('password')!.value
    ).subscribe({
      next: async(res) => {

          await delay(1000);
          this.formMessage = null;

        this.router.navigate(['']); // ejemplo de redirección luego del login
      },
      error: async(err) => {
        

        if (err.error.code != 'inactive-account') {

          this.formMessage =  this.messageService.createFormMessage(MessageType.ERROR, err.error.error)
 
          await  delay(1000);
        
           this.saving = false;
           this.formMessage = null;
        

        }else {
           
        this.setUserPasswordForm.get('id')?.setValue(err.error.id);
        this.setUserPasswordForm.get('username')?.setValue(err.error.username);
        this.saving = false;
          this.formMessage = null;
        this.setPasswordMode = true;
          
        }

  
      }
    });

    
  }



    async setUserPassword() {


    if (this.setUserPasswordForm.invalid) {

      this.messageService.createFormMessage(MessageType.ERROR, "Por favor, completá todos los campos correctamente.")
          await delay(1000);
          this.formMessage = null;

      return;
    }

  this.saving = true;

   this.setUserPasswordSubscription = this.userService.setUserPassword(
      this.setUserPasswordForm.get('id')!.value,
      this.setUserPasswordForm.get('password')!.value
    ).subscribe({
      next: async(res) => {

        this.formMessage =  this.messageService.createFormMessage(MessageType.SUCCESS, 'Clave actualizada exitosamente!');

        await delay(1000);
         this.formMessage =  this.messageService.createFormMessage(MessageType.SUCCESS, 'Ingresando...');

        this.loginForm.get('password')?.setValue(this.setUserPasswordForm.get('password')!.value);
        this.login();

        
      },
      error: async(err) => {


         this.formMessage =  this.messageService.createFormMessage(MessageType.ERROR, err.error.error)
         await  delay(1000);
        
        this.formMessage = null;
        this.saving = false;
      
          
        

  
      }
    });

    
  }

    ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    this.setUserPasswordSubscription?.unsubscribe();
  }

}