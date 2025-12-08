import { Entity, ManyToOne, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseClassParameterAbstract } from "../shared/base-class-parameter.abstract";
import { AreaClass } from "./area-class.entity";
import { AreaParameter } from "./area-parameter.entity";

@Entity({ name: "area_class_parameter" })
export class AreaClassParameter extends BaseClassParameterAbstract {
  @ManyToOne(() => AreaClass, (c) => c.parameters, { onDelete: "CASCADE" })
  classRef!: AreaClass;

  @OneToMany(() => AreaParameter, (p) => p.classParameter, { cascade: true })
  parameters!: AreaParameter[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;


  
}
