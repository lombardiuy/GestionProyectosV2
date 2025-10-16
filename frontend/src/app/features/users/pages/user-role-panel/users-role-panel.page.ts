import {  Component, OnInit, ViewChild } from '@angular/core';
import {  firstValueFrom, map, Observable,  pipe,  skip,  Subject, takeUntil, throwError } from 'rxjs';

import { UserService } from '../../services/user.service';
import { UserRoleService } from '../../services/userRole.service';

import { FormArray, FormBuilder,  FormGroup, Validators } from '@angular/forms';



import { UserRole } from '../../interfaces/userRole.interface';


import MODULE_PERMISSIONS from '../../../../../../../modulePermissions.json';
import { FormMessage, MessageType } from '../../../../shared/interfaces/form-message.interface';
import { MessageService } from '../../../../shared/services/message.service';
import { delay } from '../../../../shared/helpers/delay.helper';
import { AuthService } from '../../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { PermissionsValidator, PermissionMap } from '../../validators/permissions.validator';


@Component({
  selector: 'users-role-panel-page',
  templateUrl: './users-role-panel.page.html',
  styleUrls: ['./users-role-panel.page.scss'],
  standalone:false
})



export class UsersRolePanelPage implements OnInit {


  //General

    public loading:boolean = true;
    public saving:boolean = false;

    public selectedUserRole:UserRole | null | undefined = null;
    public userRoleCreateForm!: FormGroup;
    public userRolesList$:Observable<UserRole[] | null>;
    public formMode = "select";
    public formMessage:FormMessage | null |undefined;
    private prevFormValue:any | null | undefined;


     private destroyForm$ = new Subject<void>();
   
  
modules = MODULE_PERMISSIONS;

permissionDependencies: PermissionMap = {
      USERS_VIEW: ['USERS_CREATE', 'USERS_EDIT', 'USERS_SUSPENSION', 'USERS_SUSPENSION'],
      USERS_ROLE_VIEW: ['USERS_ROLE_CREATE', 'USERS_ROLE_EDIT']
    };

  
  

  constructor(
    private userRoleService:UserRoleService,
      private messageService:MessageService,
      private authService:AuthService,
      private route: ActivatedRoute, 

      private formBuilder:FormBuilder) {



     this.userRolesList$ = this.userRoleService.userRolesList$;
     
   

     

     
   }



  hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

  



  async ngOnInit(): Promise<void> {

    


   await this.userRoleService.getAllUserRoles();

  const roleName = this.route.snapshot.paramMap.get('roleName');


  if (roleName) {
    // Esperamos a que el observable emita su valor
    const userRoles = await firstValueFrom(this.userRolesList$);

    // Luego filtramos el resultado
    this.selectedUserRole = userRoles?.find(role => role.name === roleName);

    this.selectUserRole(this.selectedUserRole)
  }


   
  this.loading = false;

   
   
  
  }

  createUserRole(){
    

    if (this.hasPermission('USERS_ROLE_CREATE')) {

 

   
    this.selectedUserRole = {
      id:undefined,
      name:"",
      users:[],
      userRolePermissions:[]

    }
        this.createEmptyForm();

        this.formMode = 'create';
  }

    // this.listenFormChanges();
      PermissionsValidator.listenPermissions(this.userRoleCreateForm, this.permissionDependencies);


  }

selectUserRole(event: any) {
  this.createEmptyForm(); // crea todos los controles
  this.selectedUserRole = event;
  this.formMode = 'edit';

  const assignedPermissions = event.userRolePermissions.map((p: any) => p.permission);

  // Recorremos todos los controles del formulario
  Object.keys(this.userRoleCreateForm!.controls).forEach(permission => {
    const control = this.userRoleCreateForm!.get(permission);
    if (!control) return;

    // Setear true si está asignado, false si no
    control.setValue(assignedPermissions.includes(permission));

    // Deshabilitar si el usuario no tiene permiso de edición
    if (!this.hasPermission('USERS_ROLE_EDIT') || !this.hasPermission(permission)) {


   
      control.disable();
   
    } else {
      control.enable(); // opcional, para asegurarnos de que se habilite si corresponde
    }
  });

   //this.listenFormChanges();

    PermissionsValidator.listenPermissions(this.userRoleCreateForm, this.permissionDependencies);
}

   
createEmptyForm() {

  

  const group: any = {};
    for (const mod of this.modules) {
      for (const perm of mod.permissions) {
        group[perm.code] = [false];
      }
    }
    this.userRoleCreateForm = this.formBuilder.group(group);

   

  
  


}

cancelSelection() {

  this.selectedUserRole = null;
  this.createEmptyForm();
  this.formMode = 'select';
 
}

  getSelectedPermissions(): string[] {
    return Object.entries(this.userRoleCreateForm!.value)
      .filter(([_, checked]) => checked)
      .map(([code]) => code);
  }

 saveUserRole() {


  this.saving = true;

    const selectedPermissions = this.getSelectedPermissions();


    this.userRoleService.saveUserRole(this.selectedUserRole!, selectedPermissions).subscribe({
      next: async() => {
        this.formMessage = this.messageService.createFormMessage(MessageType.SUCCESS,'Rol guardado con éxito!' )
        await this.userRoleService.getAllUserRoles();
        await delay(1000);
        this.formMessage = null;
        this.saving = false;
        this.selectedUserRole = null;
        this.formMode = 'select'
    
        
             
               
      },
      error: async(err) => {
  
       this.formMessage = this.messageService.createFormMessage(MessageType.ERROR,err.error.error );
            await delay(1000);
              this.formMessage = null;
              this.saving = false;
              
      },
    });
  }







  async ngOnDestroy() {

  this.destroyForm$.next();
  this.destroyForm$.complete();



  }




  
}