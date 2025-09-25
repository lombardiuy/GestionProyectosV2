import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class NavbarstateService {

  public displaySideNavbar = new BehaviorSubject<boolean>(true);



  constructor() {

  }


async toggleSideNavbar() {
  const currentValue = await firstValueFrom(this.displaySideNavbar);

  this.displaySideNavbar.next(!currentValue)
 
}





}