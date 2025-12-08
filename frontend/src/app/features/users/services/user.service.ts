import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = environment.apiURL + 'user';

  private usersListSubject = new BehaviorSubject<User[] | null>(null);
  private selectedUserSubject = new BehaviorSubject<User | null>(null);

  public usersList$ = this.usersListSubject.asObservable();


  constructor(private http: HttpClient) {}

  /***************************************
   * CREATE
  ****************************************/

  createUser(user: User) {
    // Convertir el objeto User al DTO que espera el backend
    const dto = {
      name: user.name,
      username: user.username,
      password: user.password,
      userRole: user.userRole?.id ?? null, // SOLO el ID
    };

    return this.http.post<any>(`${this.apiUrl}/create`, dto);
  }

updateUser(user: User) {

  const dto: any = {};

  if (user.name !== undefined) dto.name = user.name;
  if (user.username !== undefined) dto.username = user.username;

  // IMPORTANTE: solo enviar el ID del rol
  if (user.userRole?.id !== undefined) {
    dto.userRole = user.userRole.id;
  }

  if (user.active !== undefined) dto.active = user.active;
  if (user.suspended !== undefined) dto.suspended = user.suspended;
  if (user.hasProfilePicture !== undefined) dto.hasProfilePicture = user.hasProfilePicture;

  return this.http.put<any>(`${this.apiUrl}/update/${user.id}`, dto);
}




  updateUserProfile(userID: number, actualPassword: string, newPassword: string, hasProfilePicture: boolean) {
    return this.http.put<any>(`${this.apiUrl}/updateUserProfile`, {
      userID,
      actualPassword,
      newPassword,
      hasProfilePicture,
    });
  }

  resetUserPassword(user: User) {
    return this.http.post<any>(`${this.apiUrl}/resetUserPassword`, {
      id: user.id,
    });
  }

  setUserPassword(id: number, password: string) {
    return this.http.post<any>(`${this.apiUrl}/setUserPassword`, { id, password });
  }

  suspensionUser(user: User) {
    return this.http.post<any>(`${this.apiUrl}/suspension`, {
      id: user.id
    });
  }



  /***************************************
   * READ
  ****************************************/

  async getAllUsers(): Promise<User[] | null> {
    try {
      const userList = await firstValueFrom(
        this.http.get<User[]>(`${this.apiUrl}`)
      );
      this.usersListSubject.next(userList);
      return userList;
    } catch (err) {
      console.error(err);
      this.usersListSubject.next(null);
      return [];
    }
  }

  async selectUser(id: number): Promise<User> {
    const selectedUser = await firstValueFrom(
      this.http.get<User>(`${this.apiUrl}/select/${id}`)
    );
    this.selectedUserSubject.next(selectedUser);
    return selectedUser;
  }

  clearUserList() {
    this.usersListSubject.next(null);
  }

  clearSelectedUser() {
    this.selectedUserSubject.next(null);
  }
}
