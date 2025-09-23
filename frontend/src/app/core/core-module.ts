import { NgModule, inject } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { AuthService } from './services/auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClientModule } from '@angular/common/http';


@NgModule({

  imports:[HttpClientModule],

   providers: [
    provideBrowserGlobalErrorListeners(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // 🚀 Inicializador que ejecuta devLogin antes de que arranque la app
    provideAppInitializer(async () => {
      const authService = inject(AuthService);

      if (!authService.isLoggedIn() && !environment.auth) {
        // Espera a que termine devLogin
        await firstValueFrom(authService.devLogin());
      }
    })
  ],

})
export class CoreModule { }
