import { Component, OnInit } from '@angular/core';
import { NavbarstateService } from '../../services/navbarstate.service';

@Component({
  selector: 'side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.scss'],
  standalone:false
})
export class SideNavbarComponent implements OnInit {

  constructor(public navbarstateService:NavbarstateService) { }

  async ngOnInit() {

  }

}
