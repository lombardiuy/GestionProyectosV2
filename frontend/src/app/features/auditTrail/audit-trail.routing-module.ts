import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditTrailPage } from './pages/audit-trail/audit-trail.page';
import { HasPermissionGuard } from '../../core/guards/hasPermission.guard';





const routes: Routes = [
  { path: '', component: AuditTrailPage, pathMatch: 'full', canActivate:[HasPermissionGuard], data:{permission:'AUDIT_TRAIL_VIEW'} } ,
  { path: ':id', component: AuditTrailPage, canActivate:[HasPermissionGuard], data:{permission:'AUDIT_TRAIL_VIEW'} } 
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
