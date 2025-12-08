import {Area} from "../../areas/interfaces/area.interface"
import { Factory } from "./factory.interface";

export interface FactoryRoute {
  id?: number;
  name: string;
  description: string;
  active: boolean;
  areas:Area[];
  factory:Factory
}
