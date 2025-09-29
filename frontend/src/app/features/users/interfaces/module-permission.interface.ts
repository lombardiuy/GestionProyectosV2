
import {UserRole} from "./user-role.interface"

export interface ModulePermission {
  id?: number;
  module: string;
  create:boolean;
  read:boolean;
  update:boolean;
  delete:boolean;
  approve:boolean;
  requiresApproval:boolean,
  userRole:UserRole | null;


}