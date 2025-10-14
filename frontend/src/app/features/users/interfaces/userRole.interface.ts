import { User } from "./user.interface";
import { UserRolePermission } from "./userRolePermission.interface";


export interface UserRole {
  id?: number;
  name: string;
  users:User[];
  userRolePermissions:UserRolePermission[]
 
}
