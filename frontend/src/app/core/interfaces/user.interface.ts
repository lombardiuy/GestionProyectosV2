


export interface User {
  id?: number;
  name: string;
  username:string;
  password:string;
  profilePicture:boolean;
  userRole:UserRole;
  active:boolean;
  


}


export interface UserRole {
   id?: number;
  name: string;
  users:User[];
  modulePermissions:ModulePermission[];



}


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