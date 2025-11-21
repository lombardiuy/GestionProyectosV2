import { EquipmentParameter} from "./equipment-parameter.interface";

export interface Equipment {
  id?: number;
  name: string;
  code: string;
  material: string;
  operationalPrinciple: string;
  brand: string;
  model: string;

  parameters: EquipmentParameter[];
}
