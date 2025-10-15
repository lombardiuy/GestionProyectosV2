import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HasPermissionGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {


    // Permiso requerido definido en la ruta
    const requiredPermission = route.data['permission'] as string;

    // Si el usuario no está logueado, redirige al login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    // Si no se definió permiso → no permitir por seguridad
    if (!requiredPermission) {
      console.warn('⚠️ Ruta sin permiso especificado');
      this.router.navigate(['/unauthorized']);
      return of(false);
    }

    // Si el usuario tiene el permiso → permitir
    if (this.authService.hasPermission(requiredPermission)) {
      return of(true);
    }

    // Si no tiene permiso → redirigir
    this.router.navigate(['/unauthorized']);
    return of(false);
  }
}
