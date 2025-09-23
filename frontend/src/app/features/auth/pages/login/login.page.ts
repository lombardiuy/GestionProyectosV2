import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'login-page',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})



export class LoginPage implements OnInit {


  
  loginForm!: FormGroup;
  loginError:boolean = false;
  loginErrorMessage:string = '';
  submitted:boolean = false;

  private loginSubscription?: Subscription;

  usernameInput:string | null = null;
  passwordInput: string | null = null;

  

  constructor(public authService: AuthService, private formBuilder: FormBuilder, private router:Router) { 
    
   const navState = this.router.getCurrentNavigation()?.extras.state;



   if (navState?.['username'] && navState?.['password']) {
    this.usernameInput = navState['username'];
    this.passwordInput = navState['password']
    
  }
  
  }

  ngOnInit(): void {

      this.loginForm = this.formBuilder.group(
      {

      username: ["", Validators.required],
      password: ["", [Validators.required, Validators.minLength(4)]]
    }
    );




    if (this.usernameInput && this.passwordInput) {

      this.username?.setValue(this.usernameInput);
      this.password?.setValue(this.passwordInput);

      this.login();

    }


  
  }
   

get username() {
  return this.loginForm.get('username');
}

get password() {
  return this.loginForm.get('password');
}



  login() {

         if (this.loginForm.invalid) {
      this.loginError = true;
      this.loginErrorMessage = 'Por favor, completá todos los campos correctamente.';
      return;
    }
  this.submitted = true;

   this.loginSubscription = this.authService.login(
      this.loginForm.get('username')!.value,
      this.loginForm.get('password')!.value
    ).subscribe({
      next: (res) => {
  
        this.loginError = false;
        this.loginErrorMessage = '';
        this.submitted = false;
        this.router.navigate(['']); // ejemplo de redirección luego del login
      },
      error: (err) => {
        

        if (err.error.code === 'inactive-account') {

           this.router.navigate(['auth/password-reset'], {
            state: {
             id: err.error.id,
            username: err.error.username
            }
});


        }

   
 
 
        this.loginError = true;
        this.loginErrorMessage = err.error.error
        this.submitted = false;
      }
    });
  }

    ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
  }

}