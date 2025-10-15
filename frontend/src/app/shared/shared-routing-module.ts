import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedPage } from './pages/unauthorized/unauthorized.page';


const routes: Routes = [
  { path: '', component: UnauthorizedPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
