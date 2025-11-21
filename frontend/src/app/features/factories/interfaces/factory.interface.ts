import {FactoryRoute} from "./factory-route.interface";

export interface Factory {
  id?: number;
  name: string;
  location: string;
  owner: string;
  contact: string;
  levels: number;

  routes: FactoryRoute[];
}


