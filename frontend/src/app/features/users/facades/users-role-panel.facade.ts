import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { delay } from '../../../shared/helpers/delay.helper';

import { AuthService } from '../../../core/services/auth.service';
import { MessageService } from '../../../shared/services/message.service';
import { UserRoleService } from '../services/userRole.service';
import { TimeService } from '../../../shared/services/time.service';

import { UserRole } from '../interfaces/userRole.interface';
import { FormMessage, MessageType } from '../../../shared/interfaces/form-message.interface';
import MODULE_PERMISSIONS from '../../../../../../modules.json';

import { PermissionsValidator, PermissionMap } from '../validators/permissions.validator';



@Injectable()
export class UsersRolePanelFacade implements OnDestroy {

  public loading$ = new BehaviorSubject<boolean>(true);
  public saving$ = new BehaviorSubject<boolean>(false);
  public timestamp$: Observable<number>;

  public selectedUserRole$ = new BehaviorSubject<UserRole | null>(null);
  public userRolesList$: Observable<UserRole[] | null>;

  public userRoleCreateForm!: FormGroup;
  public formMode$ = new BehaviorSubject<'select' | 'create' | 'edit'>('select');
  public formMessage$ = new BehaviorSubject<FormMessage | null>(null);

  private destroy$ = new Subject<void>();
  modules = MODULE_PERMISSIONS;

  permissionDependencies: PermissionMap = {
    USER_VIEW: ['USER_CREATE', 'USER_EDIT', 'USER_SUSPENSION', 'USER_SUSPENSION'],
    USER_ROLE_VIEW: ['USER_ROLE_CREATE', 'USER_ROLE_EDIT'],
    FACTORY_VIEW: ['FACTORY_CREATE', 'FACTORY_EDIT', 'FACTORY_SUSPENSION', 'FACTORY_ROUTE_CREATE', 'FACTORY_ROUTE_EDIT', 'FACTORY_ROUTE_SUSPENSION'],
    FACTORY_ROUTE_VIEW: ['FACTORY_ROUTE_CREATE', 'FACTORY_ROUTE_EDIT', 'FACTORY_ROUTE_SUSPENSION'],
  };

  constructor(
    private userRoleService: UserRoleService,
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private timeService:TimeService
  ) {
    this.timestamp$  = this.timeService.timestamp$;
    this.userRolesList$ = this.userRoleService.userRolesList$.pipe(takeUntil(this.destroy$));
  }

  hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

  async init() {
    this.loading$.next(true);
    this.timeService.refreshTimestamp();
    await this.userRoleService.getAllUserRoles();
    this.loading$.next(false);
  }

  async initSelectedRoleByName(roleName: string | null) {
    if (!roleName) return;

    const userRoles = await firstValueFrom(this.userRolesList$);
    const role = userRoles?.find(r => r.name === roleName) || null;

    if (role) {
      this.selectUserRole(role);
    }

    this.loading$.next(false);
  }

  createEmptyForm() {
    const group: any = {};
    for (const mod of this.modules) {
      for (const perm of mod.permissions) {
        group[perm.code] = [false];
      }
    }
    this.userRoleCreateForm = this.fb.group(group);
  }

  createUserRole() {
    if (!this.hasPermission('USER_ROLE_CREATE')) return;

    const newRole: UserRole = { id: undefined, name: '', users: [], userRolePermissions: [] };
    this.selectedUserRole$.next(newRole);
    this.createEmptyForm();
    this.formMode$.next('create');

    PermissionsValidator.listenPermissions(this.userRoleCreateForm, this.permissionDependencies);
  }

  selectUserRole(role: UserRole) {
    this.selectedUserRole$.next(role);
    this.formMode$.next('edit');

    this.createEmptyForm();

    const assignedPermissions = role.userRolePermissions.map(p => p.permission);

    Object.keys(this.userRoleCreateForm!.controls).forEach(permission => {
      const control = this.userRoleCreateForm!.get(permission);
      if (!control) return;

      control.setValue(assignedPermissions.includes(permission));

      if (!this.hasPermission('USER_ROLE_EDIT') || !this.hasPermission(permission)) {
        control.disable();
      } else {
        control.enable();
      }
    });

    PermissionsValidator.listenPermissions(this.userRoleCreateForm, this.permissionDependencies);
  }

  cancelSelection() {
    this.selectedUserRole$.next(null);
    this.createEmptyForm();
    this.formMode$.next('select');
  }

  getSelectedPermissions(): string[] {
    return Object.entries(this.userRoleCreateForm!.value)
      .filter(([_, checked]) => checked)
      .map(([code]) => code);
  }

  async saveUserRole() {
    const role = this.selectedUserRole$.value;
    if (!role) return;

    this.saving$.next(true);
    const selectedPermissions = this.getSelectedPermissions();

    this.userRoleService.saveUserRole(role, selectedPermissions)
      .pipe(takeUntil(this.destroy$)) // ✅ protegemos la suscripción
      .subscribe({
        next: async (res: any) => {
          this.formMessage$.next(this.messageService.createFormMessage(MessageType.SUCCESS, 'Rol guardado con éxito!'));
          await this.userRoleService.getAllUserRoles();
          await delay(1000);
          this.formMessage$.next(null);
          this.saving$.next(false);

          this.selectedUserRole$.next(null);
          this.formMode$.next('select');

          const roles = await firstValueFrom(this.userRolesList$);
          const fullRole = roles?.find(r => r.id === res.role.id);

          if (fullRole) {
            this.selectedUserRole$.next({ ...fullRole });
            this.selectUserRole(fullRole);
             this.timeService.refreshTimestamp();
          }
           
        },
        error: async (err) => {
          this.formMessage$.next(this.messageService.createFormMessage(MessageType.ERROR, err.error.error));
          await delay(1000);
          this.formMessage$.next(null);
          this.saving$.next(false);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
