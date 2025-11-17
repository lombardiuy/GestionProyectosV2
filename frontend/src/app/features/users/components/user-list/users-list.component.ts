import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { UserRole } from '../../interfaces/userRole.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'users-list-component',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  standalone: false
})
export class UsersListComponent implements OnInit {

  userListFilterForm!: FormGroup;

  @Input() profilePicturePath!: string | null;
  @Input() userList!: User[] | null;
  @Input() timestamp!: Number | null;
  @Input() hasPermission!: (code: string) => boolean;

  @Output() editUserEvent = new EventEmitter<any>();
  @Output() suspendUserFromListEvent = new EventEmitter<any>();

  public userRolesOptions: any[] = [];
  public filteredUserList: User[] = [];
  public selectedRoles: any[] = [];
  public selectedStatus: any[] = [];

  public showUserRoleFilter: boolean | undefined;
  public showUserStatusFilter: boolean | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.showUserRoleFilter = false;
    this.showUserStatusFilter = false;

    this.userListFilterForm = this.formBuilder.group({
      filter: ['']
    });

    if (this.userList) {
      this.filteredUserList = [...this.userList];
      this.updateUserRolesOptions();
    }
  }

  // 🔁 Se dispara cada vez que cambia userList
 ngOnChanges(changes: SimpleChanges): void {
  if (changes['userList'] && changes['userList'].currentValue) {
    this.userList = changes['userList'].currentValue;
    this.filteredUserList = [...(this.userList ?? [])]; // ✅ corregido
    this.updateUserRolesOptions();

    // Mantener filtros activos, si los hay
    this.filterTable();
  }
}

  private updateUserRolesOptions(): void {
    this.userRolesOptions = Array.from(
      new Map(
        this.userList?.map(u => [u.userRole.id, u.userRole])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));
  }

  filterTable(event?: any) {
    if (!this.userList) {
      this.filteredUserList = [];
      return;
    }

    const query = event?.target?.value?.toLowerCase().trim() || '';

    this.filteredUserList = this.userList.filter(user => {
      const hasRole = !!user.userRole?.name;

      const matchesRole = this.selectedRoles.length === 0 ||
        this.selectedRoles.some(role => role.name === user.userRole?.name);

      const matchesQuery = !query ||
        user.username?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.userRole?.name?.toLowerCase().includes(query);

      let matchesStatus = true;
      if (this.selectedStatus?.length) {
        matchesStatus = this.selectedStatus.some(status => {
          if (status.name === 'Suspendido') {
            return user.suspended === true;
          } else if (status.name === 'No operativo') {
            return !user.suspended && !user.active;
          } else if (status.name === 'Operativo') {
            return !user.suspended && user.active;
          }
          return false;
        });
      }

      return hasRole && matchesRole && matchesQuery && matchesStatus;
    });
  }

  editUser(user: User | null) {
    if (user && user.id) {
      this.editUserEvent.emit(user.id);
    }
  }

  userSuspensionFromList(user: User | null, suspend: boolean) {
    if (user && user.id) {
      this.suspendUserFromListEvent.emit({ id: user.id, suspend });
    }
  }

  showFilter(item: string) {
    if (item === 'userRole') {
      this.showUserRoleFilter = !this.showUserRoleFilter;
    }
    if (item === 'userStatus') {
      this.showUserStatusFilter = !this.showUserStatusFilter;
    }
  }

  ngOnDestroy(): void {}
}
