import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';




const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth-module').then(m => m.AuthModule)
  },

  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users-module').then(m => m.UsersModule)
  },


  { path: '**', redirectTo: 'auth/login' },

];



@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
