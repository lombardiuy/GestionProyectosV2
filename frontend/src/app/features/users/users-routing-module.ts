import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersPanelPage } from './pages/users-panel/users-panel.page';

const routes: Routes = [
     { path: '', component: UsersPanelPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
