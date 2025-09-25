import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersRoutingModule } from './users-routing-module';

import { UsersPanelPage } from './pages/users-panel/users-panel.page';
import { UsersListComponent } from './components/user-list/users-list.component';
import { UsersCreateComponent } from './components/user-create/user-create.component';


@NgModule({
  declarations: [
    UsersPanelPage, UsersListComponent, UsersCreateComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule, 
    ReactiveFormsModule
  ]
})
export class UsersModule { }
