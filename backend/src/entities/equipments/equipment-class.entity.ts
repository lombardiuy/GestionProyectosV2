import { Entity, OneToMany } from "typeorm";
import { BaseClassAbstract } from "../shared/base-class.abstract";
import { EquipmentClassParameter } from "./equipment-class-parameter.entity";

@Entity({ name: "equipment_class" })
export class EquipmentClass extends BaseClassAbstract {
  @OneToMany(() => EquipmentClassParameter, (p) => p.classRef)
  parameters!: EquipmentClassParameter[];
}
