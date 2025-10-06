import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

import { UserRole } from '../interfaces/user-role.interface';
import {User} from '../interfaces/user.interface'

@Injectable({
  providedIn: 'root',
})
export class UserService {

 private apiUrl = environment.apiURL + 'user';

  private usersListSubject = new BehaviorSubject<User[] | null>(null);
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  private userRolesListSubject = new BehaviorSubject<UserRole[] | null>(null);
  
  
  public usersList$ = this.usersListSubject.asObservable();
  public selectedUser$ = this.selectedUserSubject.asObservable();
  public userRolesList$ = this.userRolesListSubject.asObservable();

  constructor(private http: HttpClient) {

  }





  /***************************************
   * CREATE
  ****************************************/


  createUser(user:User) {

  return this.http.post<any>(`${this.apiUrl}/create`,  user);


}

  resetUserPassword(user:User) {

  return this.http.post<any>(`${this.apiUrl}/resetUserPassword`,  user);


}

  suspendUser(user:User) {

  return this.http.post<any>(`${this.apiUrl}/suspend`,  user);


}

  unSuspendUser(user:User) {

  return this.http.post<any>(`${this.apiUrl}/unSuspend`,  user);


}


  /***************************************
   * READ
  ****************************************/


async getAllUsers(): Promise<User[] | null> {
  try {
    const userList = await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/list`));
    this.usersListSubject.next(userList);
    return userList;
  } catch (err) {
    console.error(err);
    this.usersListSubject.next(null); 
    return [];
  }
}


async getAllUserRoles(): Promise<UserRole[] | null> {
  try {
    const userRolesList = await firstValueFrom(this.http.get<UserRole[]>(`${this.apiUrl}/roles`));
    this.userRolesListSubject.next(userRolesList);
    console.log(userRolesList)
    return userRolesList;
  } catch (err) {
    console.error(err);
    this.userRolesListSubject.next(null); 
    return [];
  }
}

async selectUser(id: number): Promise<User> {
  const selectedUser = await firstValueFrom(
    this.http.get<User>(`${this.apiUrl}/select/${id}`)
  )
  this.selectedUserSubject.next(selectedUser)
  return selectedUser
}


  /***************************************
   * UPDATE
  ****************************************/


  /***************************************
   * DELETE
  ****************************************/

  
  clearUserList() {
    this.usersListSubject.next(null);
  }
  
  clearUserRoleList() {
    this.userRolesListSubject.next(null);
  }

  clearSelectedUser() {
    this.selectedUserSubject.next(null);
  }


}