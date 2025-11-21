import { Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseClassParameterAbstract } from "../shared/base-class-parameter.abstract";
import { AreaClass } from "./area-class.entity";
import { AreaParameter } from "./area-parameter.entity";

@Entity({ name: "area_class_parameter" })
export class AreaClassParameter extends BaseClassParameterAbstract {
  @ManyToOne(() => AreaClass, (c) => c.parameters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "area_class_id" })
  classRef!: AreaClass;

  @OneToMany(() => AreaParameter, (p) => p.classParameter)
  parameters!: AreaParameter[];
}
