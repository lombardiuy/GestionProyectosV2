import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/hasPermission.guard';
import { FactoriesPanelPage } from './pages/factories-panel/factories-panel.page';




const routes: Routes = [
  { path: '', component: FactoriesPanelPage, canActivate:[HasPermissionGuard], data:{permission:'FACTORY_VIEW'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactoriesRoutingModule { }
