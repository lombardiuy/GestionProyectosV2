import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';



@Injectable({
  providedIn: 'root',
})
export class TimeService {

  private timestampSubject = new BehaviorSubject<number>(Date.now());
  public timestamp$ = this.timestampSubject.asObservable();


  constructor() {

  }




 refreshTimestamp() {
    this.timestampSubject.next(Date.now());
  }





}