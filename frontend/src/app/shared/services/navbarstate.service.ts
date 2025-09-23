import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class NavbarstateService {

  public displaySideNavbar = new BehaviorSubject<string>('false');
  public timestamp$ = new BehaviorSubject<number>(Date.now());


  constructor() {

  }


async toggleSideNavbar() {
  const currentValue = await firstValueFrom(this.displaySideNavbar);

  if (currentValue === 'true') {

     this.displaySideNavbar.next('false');
  }else {
         this.displaySideNavbar.next('true');
  }
 
}

 refreshTimestamp() {
    this.timestamp$.next(Date.now());
  }





}