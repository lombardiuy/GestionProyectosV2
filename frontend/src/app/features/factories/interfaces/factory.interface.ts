import {FactoryRoute} from "./factory-route.interface";

export interface Factory {
  id?: number;
  name: string;
  location: string;
  contact: string;
  active: boolean;
  hasProfilePicture:boolean;
  version:number;
  routes: FactoryRoute[];

}


