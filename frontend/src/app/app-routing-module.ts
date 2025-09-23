import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importa los layouts
import { PrivatelayoutComponent } from './layouts/private-layout/private-layout.component';
import { PubliclayoutComponent } from './layouts/public-layout/public-layout.component';

const routes: Routes = [

  // Rutas de autenticación con layout sin navbar ni sidebar
  {
    path: 'auth',
    component: PubliclayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/auth/auth-module').then(m => m.AuthModule) // Nota: 'auth.module' no 'auth-module'
      }
    ]
  },

  // Rutas principales con layout que contiene navbar y sidebar
  {
    path: '',
    component: PrivatelayoutComponent,
    children: [
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users-module').then(m => m.UsersModule) // Igual, cuidado con el nombre del archivo
      },
      // Aquí puedes agregar más rutas hijas protegidas o con sidebar/topbar
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
