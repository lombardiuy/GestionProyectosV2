import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const isLogged = this.authService.isLoggedIn();
    if (isLogged) {
      return of(true);
    }
    this.router.navigate(['/auth/login']);
    return of(false);
  }
}