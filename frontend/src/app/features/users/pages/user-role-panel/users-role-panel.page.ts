import {  Component, OnInit } from '@angular/core';
import { UsersRolePanelFacade } from '../../facades/users-role-panel.facade';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'users-role-panel-page',
  templateUrl: './users-role-panel.page.html',
  styleUrls: ['./users-role-panel.page.scss'],
  standalone:false
 
})
export class UsersRolePanelPage implements OnInit {

  constructor(
    public facade: UsersRolePanelFacade,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit() {
     await this.facade.init();
    const roleName = this.route.snapshot.paramMap.get('roleName');
     await this.facade.initSelectedRoleByName(roleName);
  }

  ngOnDestroy() {
    this.facade.ngOnDestroy();
  }
}
