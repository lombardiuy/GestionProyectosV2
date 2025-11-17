import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'audit-trail-page',
  templateUrl: './audit-trail.page.html',
  styleUrls: ['./audit-trail.page.scss'],
  standalone:false
})



export class AuditTrailPage implements OnInit {



  public loading: boolean = true;
  

  constructor(){}

  ngOnInit(): void {

   // this.loading = false;


  }
   


    ngOnDestroy(): void {

  }

}