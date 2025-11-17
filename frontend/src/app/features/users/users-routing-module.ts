import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfilePage} from './pages/user-profile/user-profile.page';
import { UsersPanelPage } from './pages/users-panel/users-panel.page';
import { UsersRolePanelPage } from './pages/user-role-panel/users-role-panel.page';
import { HasPermissionGuard } from '../../core/guards/hasPermission.guard';


const routes: Routes = [
    { path: '', component: UsersPanelPage, canActivate:[HasPermissionGuard], data:{permission:'USERS_VIEW'} },
    { path: 'profile', component: UserProfilePage },
    { path: 'roles', component: UsersRolePanelPage, canActivate:[HasPermissionGuard], data:{permission:'USERS_ROLE_VIEW'} },
    { path: 'roles/:roleName', component: UsersRolePanelPage, canActivate:[HasPermissionGuard], data:{permission:'USERS_ROLE_VIEW'} }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
