import { Component, OnInit } from '@angular/core';
import { NavbarstateService } from '../../shared/services/navbarstate.service';


@Component({
  selector: 'private-layout',
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss'],
  standalone:false
})



export class PrivatelayoutComponent implements OnInit {


  

  constructor(public navbarstateService:NavbarstateService) { 
  
  }

  ngOnInit(): void {




  
  }
   
}