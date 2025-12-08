import { Entity, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseClassAbstract } from "../shared/base-class.abstract";
import { AreaClassParameter } from "./area-class-parameter.entity";
import { Area } from "./area.entity";


@Entity({ name: "area_class" })
export class AreaClass extends BaseClassAbstract {
  @OneToMany(() => AreaClassParameter, (p) => p.classRef, { cascade: true })
  parameters!: AreaClassParameter[];

  @OneToMany(() => Area, (area) => area.areaClass)
   areas!: Area[];

  @VersionColumn()
  public version!:number;
     
  @CreateDateColumn()
  public created!: Date;
     
  @UpdateDateColumn()
  public updated!: Date;

  
}
