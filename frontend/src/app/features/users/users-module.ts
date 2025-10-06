import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing-module';

import { SharedModule } from '../../shared/shared-module';


import { UsersPanelPage } from './pages/users-panel/users-panel.page';
import { UsersListComponent } from './components/user-list/users-list.component';
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserPasswordResetComponent } from './components/user-password-reset/user-password-reset.component';
import { UserSuspendComponent } from './components/user-suspend/user-suspend.component';
import { UserUnSuspendComponent } from './components/user-unsuspend/user-unsuspend.component';


@NgModule({
  declarations: [
    UsersPanelPage, UsersListComponent, UserCreateComponent, UserPasswordResetComponent, UserSuspendComponent, UserUnSuspendComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule, 
    ReactiveFormsModule, 
    SharedModule
  ]
})
export class UsersModule { }
