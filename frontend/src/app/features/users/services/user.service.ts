import { Injectable } from '@angular/core';
import {User} from '../interfaces/user.interface'
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {

 private apiUrl = environment.apiURL + 'user';

  private userListSubject = new BehaviorSubject<User[] | null>(null);
  public userList$ = this.userListSubject.asObservable();
  
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  public selectedUser$ = this.selectedUserSubject.asObservable();

  constructor(private http: HttpClient) {

  }


  /***************************************
   * CREATE
  ****************************************/
  //READ


async getAllUsers(): Promise<User[] | null> {
  try {
    const userList = await firstValueFrom(this.http.get<User[]>(`${this.apiUrl}/list`));
    this.userListSubject.next(userList);
    return userList;
  } catch (err) {
    console.error(err);
    this.userListSubject.next(null); 
    return [];
  }
}


  //UPDATE


  //DELETE





}