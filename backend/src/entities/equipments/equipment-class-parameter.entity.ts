import { Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseClassParameterAbstract } from "../shared/base-class-parameter.abstract";
import { EquipmentClass } from "./equipment-class.entity";
import { EquipmentParameter } from "./equipment-parameter.entity";

@Entity({ name: "equipment_class_parameter" })
export class EquipmentClassParameter extends BaseClassParameterAbstract {
  @ManyToOne(() => EquipmentClass, (c) => c.parameters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "equipment_class_id" })
  classRef!: EquipmentClass;

  @OneToMany(() => EquipmentParameter, (p) => p.classParameter)
  parameters!: EquipmentParameter[];
}
