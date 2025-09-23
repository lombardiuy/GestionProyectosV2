import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { NavbarstateService } from '../../services/navbarstate.service';


@Component({
  selector: 'top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.scss'],
  standalone:false
})
export class TopNavbarComponent implements OnInit {

  profilePicturePath =  environment.publicURL+'users/profilePic/';
  
  productionMode =environment.productionMode;

  public toggleFlag = false;

    private timeStampSubscription: Subscription;
  
     timestamp: number = 0;

  constructor(public authService:AuthService,  private router: Router, public navbarstateService:NavbarstateService) {

      this.timeStampSubscription = this.navbarstateService.timestamp$.subscribe(ts => {
      this.timestamp = ts;
  });

   }

  ngOnInit(): void {
  }

   showDropdown() { this.toggleFlag = !this.toggleFlag; }


  async logOut() {

     this.authService.logOut();
 
     this.router.navigate(['auth/login']);
   
 
   }

    ngOnDestroy() {
    // Limpiamos la suscripción para evitar memory leaks
    if (this.timeStampSubscription) {
      this.timeStampSubscription.unsubscribe();
    }
  }

}
