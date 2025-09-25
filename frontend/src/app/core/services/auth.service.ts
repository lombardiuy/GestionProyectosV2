import { Injectable } from '@angular/core';
import { BehaviorSubject, of, switchMap, tap, throwError } from 'rxjs';
import { User } from '../../features/users/interfaces/user.interface';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';


export type DecodedToken = Omit<User, 'password'> & {
  iat: number;
  exp: number;
};
@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiURL + 'auth';
  private tokenKey = 'authToken';

  public userProfile$ = new BehaviorSubject<DecodedToken | null>(null);

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const decoded = this.getDecodedToken();
      this.userProfile$.next(decoded);
    } else {
      this.userProfile$.next(null);
      this.clearToken();
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Verifica si el token no expiró
      return Date.now() < decoded.exp * 1000;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    console.log(token !== null && this.isTokenValid(token))
    return token !== null && this.isTokenValid(token);
  }

  devLogin() {
    return this.http.get<any>(`${this.apiUrl}/getDevToken`).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.token);
        const decoded = jwtDecode<DecodedToken>(res.token);
        this.userProfile$.next(decoded);
      })
    );
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      switchMap(res => {
        const decoded = jwtDecode<DecodedToken>(res.token);

        if (decoded.status  === 'reset-password') {
          return throwError(() => ({
            error: {
              code: 'inactive-account',
              id: decoded.id,
              username: decoded.username,
              error: 'Tu cuenta no está activa. Por favor, restablecé tu contraseña.'
            }
          }));
        }

        localStorage.setItem(this.tokenKey, res.token);
        this.userProfile$.next(decoded);

        return of(res);
      })
    );
  }

  logOut(): void {
    this.clearToken();
    this.userProfile$.next(null);
  }
}
