import { Entity, ManyToOne, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseClassParameterAbstract } from "../shared/base-class-parameter.abstract";
import { EquipmentClass } from "./equipment-class.entity";
import { EquipmentParameter } from "./equipment-parameter.entity";

@Entity({ name: "equipment_class_parameter" })
export class EquipmentClassParameter extends BaseClassParameterAbstract {
  @ManyToOne(() => EquipmentClass, (c) => c.parameters, { onDelete: "CASCADE" })
  classRef!: EquipmentClass;

  @OneToMany(() => EquipmentParameter, (p) => p.classParameter, { cascade: true })
  parameters!: EquipmentParameter[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;
}
