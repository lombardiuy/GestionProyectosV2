import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HasPermissionGuard } from '../../core/guards/hasPermission.guard';
import { FactoriesManagerPage } from './pages/factories-manager/factories-manager.page';
import { FactoryPanelPage } from './pages/factory-panel/factory-panel.page';





const routes: Routes = [
  { path: '', component: FactoriesManagerPage, canActivate:[HasPermissionGuard], data:{permission:'FACTORY_VIEW'} },
  { path: ':factoryName', component: FactoryPanelPage, canActivate:[HasPermissionGuard], data:{permission:'FACTORY_VIEW'} },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactoriesRoutingModule { }
