import { EquipmentParameter} from "./equipment-parameter.interface";
import { EquipmentClass} from "./equipment-class.interface";

export interface Equipment {
  id?: number;
  name: string;
  code: string;
  material: string;
  operationalPrinciple: string;
  brand: string;
  model: string;
  hasPicture:boolean;
  active: boolean;
  equipmentClass:EquipmentClass;
  parameters: EquipmentParameter[];
}
