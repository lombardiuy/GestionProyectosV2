import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { UserRole } from '../../interfaces/userRole.interface';


import { UserService } from '../../services/user.service';


@Component({
  selector: 'users-role-list-component',
  templateUrl: './users-role-list.component.html',
  styleUrls: ['./users-role-list.component.scss'],
  standalone:false
})



export class UsersRoleListComponent implements OnInit {


   @Input() selectedUserRole:UserRole | null | undefined;

   @Input() userRolesList!: UserRole[] | null;

   @Output() selectUserRoleEvent = new EventEmitter<UserRole>();

  

  constructor() {

    


  }

  ngOnInit(): void {

  
  }





    ngOnDestroy(): void {
 
  }


  selectUserRole(event:any){

    this.selectUserRoleEvent.emit(event)


  }

  
}