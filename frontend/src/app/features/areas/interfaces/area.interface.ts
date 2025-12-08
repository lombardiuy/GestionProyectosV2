import { AreaParameter } from "./area-parameter.interface";
import { Equipment } from "../../equipments/interfaces/equipment.interface";
import { AreaClass } from "./area-class.interface";
import { FactoryRoute } from "../../factories/interfaces/factory-route.interface";

export interface Area {
  id?: number;
  name: string;
  code: string;
  active: boolean;
  routes: FactoryRoute[];
  areaClass:AreaClass
  parameters: AreaParameter[];
  equipments: Equipment[];
}
