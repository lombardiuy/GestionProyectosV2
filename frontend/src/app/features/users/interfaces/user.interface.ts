
import {UserRole} from "./userRole.interface"


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

