import { AreaParameter } from "./area-parameter.interface";
import { Equipment } from "../../equipments/interfaces/equipment.interface";

export interface Area {
  id?: number;
  name: string;
  code: string;
  routeId: number;

  parameters: AreaParameter[];
  equipments: Equipment[];
}
