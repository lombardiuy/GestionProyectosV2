import { Entity, ManyToOne, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseParameterAbstract } from "../shared/base-parameter.abstract";
import { AreaClassParameter } from "./area-class-parameter.entity";
import { Area } from "./area.entity";

@Entity({ name: "area_parameter" })
export class AreaParameter extends BaseParameterAbstract {
  @ManyToOne(() => AreaClassParameter, (cp) => cp.parameters, { nullable: true, onDelete: "SET NULL" })
  classParameter!: AreaClassParameter;

  @ManyToOne(() => Area, (a) => a.parameters, { onDelete: "CASCADE" })
  area!: Area;

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;
}
