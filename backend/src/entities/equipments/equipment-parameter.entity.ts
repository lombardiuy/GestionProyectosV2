import { Entity, ManyToOne, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseParameterAbstract } from "../shared/base-parameter.abstract";
import { EquipmentClassParameter } from "./equipment-class-parameter.entity";
import { Equipment } from "./equipment.entity";

@Entity({ name: "equipment_parameter" })
export class EquipmentParameter extends BaseParameterAbstract {
  @ManyToOne(() => EquipmentClassParameter, (cp) => cp.parameters, { nullable: true, onDelete: "SET NULL" })
  classParameter!: EquipmentClassParameter;

  @ManyToOne(() => Equipment, (e) => e.parameters, { onDelete: "CASCADE" })
  equipment!: Equipment;

    @VersionColumn()
    public version!:number;
    
    @CreateDateColumn()
    public created!: Date;
    
    @UpdateDateColumn()
    public updated!: Date;
}
