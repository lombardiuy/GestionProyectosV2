import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';


@Component({
  selector: 'users-list-component',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  standalone:false
})



export class UsersListComponent implements OnInit {

   

   userListFilterForm!: FormGroup;
    
   @Input() profilePicturePath!: string | null;
   @Input() userList!: User[] | null;
   @Input() timestamp!: Number | null;
   @Output() editUserEvent = new EventEmitter<any>();


   filteredUserList: User[] | null = [];


    

  

  constructor(private formBuilder: FormBuilder, private userService:UserService) { }


  ngOnInit(): void {

 this.userListFilterForm = this.formBuilder.group({ filter: [''] });
 this.filteredUserList = this.userList;


  
  
  }
ngOnChanges(changes: SimpleChanges) {
    if (changes['userList']) {
     
      this.filteredUserList = this.userList;  
    }
    
  }


filterTable(event: any) {
  const query = (event?.target?.value || '').toLowerCase().trim();

  if (!this.userList) {
    this.filteredUserList = [];
    return;
  }

  this.filteredUserList = this.userList.filter(user =>
    user.username?.toLowerCase().includes(query) ||
    user.name?.toLowerCase().includes(query) ||
    user.userRole?.name?.toLowerCase().includes(query)
  );
}


  editUser(user:User | null) {
    

    if (user && user.id) {

     this.editUserEvent.emit(user.id);
    }
  
    


  }
  
    ngOnDestroy(): void {
 
  }

}