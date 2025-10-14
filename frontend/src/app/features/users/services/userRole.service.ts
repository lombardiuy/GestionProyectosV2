import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { UserRole } from '../interfaces/userRole.interface';
import { environment } from '../../../../environments/environment';



@Injectable({ providedIn: 'root' })
export class UserRoleService {

 private apiUrl = environment.apiURL + 'user/roles';

    private userRolesListSubject = new BehaviorSubject<UserRole[] | null>(null);
    public userRolesList$ = this.userRolesListSubject.asObservable();
    

  constructor(private http: HttpClient) {}

async getAllUserRoles(): Promise<UserRole[] | null> {
  try {
    const userRolesList = await firstValueFrom(this.http.get<UserRole[]>(`${this.apiUrl}`));
    this.userRolesListSubject.next(userRolesList);

    return userRolesList;
  } catch (err) {
    console.error(err);
    this.userRolesListSubject.next(null); 
    return [];
  }
}

 saveUserRole(userRole:UserRole, permissions:string[]): Observable<UserRole> {
  return this.http.post<UserRole>(`${this.apiUrl}/create`,{ userRole, permissions});
}






  clearUserRoleList() {
    this.userRolesListSubject.next(null);
  }
}
