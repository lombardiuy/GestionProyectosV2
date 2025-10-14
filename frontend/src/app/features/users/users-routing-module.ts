import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersPanelPage } from './pages/users-panel/users-panel.page';
import { UsersRolePanelPage } from './pages/user-role-panel/users-role-panel.page';

const routes: Routes = [
     { path: '', component: UsersPanelPage },
     { path: 'roles', component: UsersRolePanelPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
