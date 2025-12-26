import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing-module';

import { SharedModule } from '../../shared/shared-module';


import { UsersPanelPage } from './pages/users-panel/users-panel.page';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserCreateComponent } from './components/user-create/user-create.component';
import { UserPasswordResetComponent } from './components/user-password-reset/user-password-reset.component';
import { UserSuspensionComponent } from './components/user-suspension/user-suspension.component';

import { UsersRolePanelPage } from './pages/user-role-panel/users-role-panel.page';
import { UsersRoleListComponent } from './components/user-role-list/users-role-list.component';
import { UserRoleCreateComponent } from './components/user-role-create/user-role-create.component';
import { UserProfilePage } from './pages/user-profile/user-profile.page';


import { UsersPanelFacade } from './facades/users-panel.facade';
import { CreateUserUseCase } from './use-cases/create-user.usecase';
import { UpdateUserUseCase } from './use-cases/update-user.usecase';
import { ResetPasswordUseCase } from './use-cases/reset-password.usecase';
import { SuspendUserUseCase } from './use-cases/suspend-user.usecase';
import { UserProfileFacade } from './facades/user-profile.facade';
import { UpdateUserProfileUseCase } from './use-cases/update-user-profile.usecase';
import { UploadUserProfilePictureUseCase } from './use-cases/upload-user-profile-picture.usecase';




@NgModule({
  declarations: [
    UsersPanelPage, UsersListComponent, UserCreateComponent, UserPasswordResetComponent, UserSuspensionComponent,
    UsersRolePanelPage, UsersRoleListComponent, UserRoleCreateComponent, UserProfilePage
  ],
  imports: [
    CommonModule,
    UsersRoutingModule, 
    FormsModule,
    ReactiveFormsModule, 
    SharedModule
  ], 
  providers: [
    UsersPanelFacade, CreateUserUseCase, UpdateUserUseCase,ResetPasswordUseCase, SuspendUserUseCase,
    UserProfileFacade, UpdateUserProfileUseCase, UploadUserProfilePictureUseCase,

  ]

})
export class UsersModule { }
