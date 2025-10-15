import { Component, OnInit } from '@angular/core';
import { NavbarstateService } from '../../shared/services/navbarstate.service';
import { AuthService } from '../../core/services/auth.service';


@Component({
  selector: 'private-layout',
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss'],
  standalone:false
})



export class PrivatelayoutComponent implements OnInit {


  

  constructor(public navbarstateService:NavbarstateService, private authService:AuthService) { 
  
  }

  ngOnInit(): void {




  
  }

    hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

   
}