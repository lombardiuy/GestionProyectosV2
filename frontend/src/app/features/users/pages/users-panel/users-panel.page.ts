import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {  Observable } from 'rxjs';
import { TimeService } from '../../../../shared/services/time.service';
import {User} from "../../interfaces/user.interface";
import { environment } from '../../../../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validUsername } from '../../validators/valid-username.validator';



@Component({
  selector: 'users-panel-page',
  templateUrl: './users-panel.page.html',
  styleUrls: ['./users-panel.page.scss'],
  standalone:false
})



export class UsersPanelPage implements OnInit {

  //General

  profilePicturePath =  environment.publicURL+'users/profilePic/';
  

 //LISTAR USUARIOS

   public timestamp$: Observable<number>;
   public userList$: Observable<User[] | null>;

  //CREAR/EDITAR USUARIOS


  userCreateForm!: FormGroup;

  public selectedUser$: Observable<User | null>;


  

  constructor(private userService:UserService, private timeService:TimeService, private formBuilder:FormBuilder) {


     this.userList$ = this.userService.userList$;
     this.selectedUser$ = this.userService.selectedUser$;
     this.timestamp$ = this.timeService.timestamp$;
     

     
   }


  async ngOnInit(): Promise<void> {

     await this.userService.getAllUsers();


       this.userCreateForm = this.formBuilder.group(
      
      {
      
      id: [null],
      name: ["", [Validators.required, Validators.minLength(6)]],
      username: ["", Validators.required],
      password: [""],
      profilePicture:[false],
      userRole: ["", Validators.required],
      status:['', Validators.required],
      profilePictureFile:[]



    },
     {
      validator: validUsername("name")
    }
    );



  
  
  }
  
  
  
  
  
}