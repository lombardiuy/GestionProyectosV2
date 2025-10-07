import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing-module';

import { SharedModule } from '../../shared/shared-module';


import { UsersPanelPage } from './pages/users-panel/users-panel.page';
import { UsersListComponent } from './components/user-list/users-list.component';
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserPasswordResetComponent } from './components/user-password-reset/user-password-reset.component';
import { UserSuspensionComponent } from './components/user-suspension/user-suspension.component';



@NgModule({
  declarations: [
    UsersPanelPage, UsersListComponent, UserCreateComponent, UserPasswordResetComponent, UserSuspensionComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule, 
    ReactiveFormsModule, 
    SharedModule
  ]
})
export class UsersModule { }
