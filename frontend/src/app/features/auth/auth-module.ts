import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginPage } from './pages/login/login.page';
import { LoginComponent } from './components/login/login.component';
import { SetPasswordComponent } from './components/set-password/set-password.component';
import { SharedModule } from '../../shared/shared-module';



@NgModule({
  declarations: [LoginPage, LoginComponent, SetPasswordComponent],
  imports: [
    CommonModule,
    AuthRoutingModule, 
    ReactiveFormsModule, 
    SharedModule
    
  ]
})
export class AuthModule { }
