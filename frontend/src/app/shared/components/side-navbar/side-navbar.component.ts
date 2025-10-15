import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.scss'],
  standalone:false
})
export class SideNavbarComponent implements OnInit {

     @Input() hasPermission!: (code: string) => boolean;

  constructor() { }

  async ngOnInit() {

  }

}
