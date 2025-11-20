import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditTrailPage } from './pages/audit-trail/audit-trail.page';




const routes: Routes = [
  { path: '', component: AuditTrailPage, pathMatch: 'full' },
  { path: ':id', component: AuditTrailPage }   
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
