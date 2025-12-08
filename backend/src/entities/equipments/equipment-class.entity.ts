import { Entity, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseClassAbstract } from "../shared/base-class.abstract";
import { EquipmentClassParameter } from "./equipment-class-parameter.entity";
import { Equipment } from "./equipment.entity";

@Entity({ name: "equipment_class" })
export class EquipmentClass extends BaseClassAbstract {
  
  
  @OneToMany(() => EquipmentClassParameter, (p) => p.classRef, { cascade: true })
  parameters!: EquipmentClassParameter[];

  @OneToMany(() => Equipment, (equipment) => equipment.equipmentClass)
  equipments!: Equipment[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;
}
