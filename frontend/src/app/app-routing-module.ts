import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { PrivatelayoutComponent } from './layouts/private-layout/private-layout.component';
import { PubliclayoutComponent } from './layouts/public-layout/public-layout.component';


import { AuthGuard } from './core/guards/auth.guard';



const routes: Routes = [

  // Rutas públicas
  {
    path: 'auth',
    component: PubliclayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth-module').then(m => m.AuthModule) 
      }
    ]
  },
    {
    path: 'unauthorized',
    component: PrivatelayoutComponent,
      children: [
      {
        path: '',
        loadChildren: () =>
          import('./shared/shared-module').then(m => m.SharedModule) 
      },
   
    ]
    
  },



 // Rutas privadas
  {
    path: '',
    component: PrivatelayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users-module').then(m => m.UsersModule) 
      },
       {
        path: 'auditTrail',
        loadChildren: () =>
          import('./features/auditTrail/audit-trail-module').then(m => m.AuditTrailModule) 
      },
   
    ]
  },



  // Redirección en caso de ruta no encontrada
  { path: '**', redirectTo: 'auth/login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
