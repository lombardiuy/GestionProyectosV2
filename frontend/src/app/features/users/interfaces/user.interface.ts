
import {UserRole} from "./userRole.interface"


export interface User {
  id?: number;
  name: string;
  username:string;
  password:string;
  profilePicture:string;
  userRole:UserRole;
  active:boolean;
  suspended:boolean;
  


}

