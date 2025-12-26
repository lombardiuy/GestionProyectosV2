import {  Component, OnInit, ViewChild } from '@angular/core';

import { UserCreateComponent } from '../../components/user-create/user-create.component';
import { UserPasswordResetComponent } from '../../components/user-password-reset/user-password-reset.component';
import { UserSuspensionComponent } from '../../components/user-suspension/user-suspension.component';


import { FormMessage, MessageType } from '../../../../shared/interfaces/form-message.interface';
import { AuthService } from '../../../../core/services/auth.service';
import { UsersPanelFacade } from '../../facades/users-panel.facade';
import { ModalService } from '../../../../shared/services/modal.service';

@Component({
  selector: 'users-panel-page',
  templateUrl: './users-panel.page.html',
  styleUrls: ['./users-panel.page.scss'],
  standalone:false
})



export class UsersPanelPage implements OnInit {





 //LISTAR USUARIOS




  @ViewChild(UserCreateComponent) userCreateComponent!: UserCreateComponent;
  @ViewChild(UserPasswordResetComponent) userPasswordResetComponent!: UserPasswordResetComponent;
  @ViewChild(UserSuspensionComponent) userSuspensionComponent!: UserSuspensionComponent;


  

  
  

  constructor(
    private authService:AuthService,
    public userPanelFacade:UsersPanelFacade,
    private modalService:ModalService
  ) {}

  

  



  async ngOnInit(): Promise<void> {


   await this.userPanelFacade.initPanel();
  }

   displayCreateUserModal() { 
    this.userPanelFacade.initForm();
    this.modalService.open('createUserModal');
  }
    
   displayEditUserModal(user: any) { 
    this.userPanelFacade.initForm(user);
    this.modalService.open('createUserModal');
   }

   displayUserSuspensionModal(event:any) {

  
    if (event.suspensionOrigin === 'LIST') {
      this.userPanelFacade.initForm(event.user)
    }
     this.userPanelFacade.suspensionOrigin = event.suspensionOrigin;
    this.userPanelFacade.suspend = !event.user.suspended;

    
     this.modalService.open('userSuspensionModal');

    
  
  }

   async saveUserAction() {

    const isNewUser = !this.userPanelFacade.form.value.id 
    
    await this.userPanelFacade.saveUser();


  if (isNewUser) {
  

      this.userCreateComponent.closeModal();

  }

  
  }

  async userSuspensionAction(event:any) {
    
    await this.userPanelFacade.suspensionUser(event);
    this.userSuspensionComponent.closeModal();
  

  }

    async userPasswordResetAction() {
    await this.userPanelFacade.resetPassword();
    this.userPasswordResetComponent.closeModal();
  

  }







 

 




  hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

  
  async ngOnDestroy() {
    await this.userPanelFacade.destroyPanel();

  }


  
}