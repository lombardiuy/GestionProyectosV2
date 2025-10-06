
import {UserRole} from "./user-role.interface"


export interface User {
  id?: number;
  name: string;
  username:string;
  password:string;
  hasProfilePicture:boolean;
  userRole:UserRole;
  active:boolean;
  suspended:boolean;
  


}

