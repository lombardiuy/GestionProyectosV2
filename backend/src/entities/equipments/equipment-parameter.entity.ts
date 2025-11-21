import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseParameterAbstract } from "../shared/base-parameter.abstract";
import { EquipmentClassParameter } from "./equipment-class-parameter.entity";
import { Equipment } from "./equipment.entity";

@Entity({ name: "equipment_parameter" })
export class EquipmentParameter extends BaseParameterAbstract {
  @ManyToOne(() => EquipmentClassParameter, (cp) => cp.parameters, { onDelete: "SET NULL" })
  @JoinColumn({ name: "class_parameter_id" })
  classParameter!: EquipmentClassParameter;

  @ManyToOne(() => Equipment, (e) => e.parameters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "equipment_id" })
  equipment!: Equipment;
}
