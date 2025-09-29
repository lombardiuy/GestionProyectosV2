
import {UserRole} from "./user-role.interface"
import { UserStatus } from "./user-status.enum";


export interface User {
  id?: number;
  name: string;
  username:string;
  password:string;
  hasProfilePicture:boolean;
  userRole:UserRole;
  status:UserStatus;
  


}

