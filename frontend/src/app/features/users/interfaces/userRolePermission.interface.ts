
import {UserRole} from "./userRole.interface"

export interface UserRolePermission {
  id?: number;
  module: string;
  permission:string;
  userRole?:UserRole


}
