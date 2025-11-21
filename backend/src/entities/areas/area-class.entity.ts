import { Entity, OneToMany } from "typeorm";
import { BaseClassAbstract } from "../shared/base-class.abstract";
import { AreaClassParameter } from "./area-class-parameter.entity";

@Entity({ name: "area_class" })
export class AreaClass extends BaseClassAbstract {
  @OneToMany(() => AreaClassParameter, (p) => p.classRef)
  parameters!: AreaClassParameter[];
}
