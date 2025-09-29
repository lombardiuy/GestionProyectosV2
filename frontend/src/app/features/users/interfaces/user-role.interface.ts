import { User } from "./user.interface";
import {ModulePermission} from "./module-permission.interface"

export interface UserRole {
   id?: number;
  name: string;
  users:User[];
  modulePermissions:ModulePermission[];



}


