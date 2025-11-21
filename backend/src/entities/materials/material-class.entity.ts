import { Entity, OneToMany } from "typeorm";
import { BaseClassAbstract } from "../shared/base-class.abstract";
import { MaterialClassParameter } from "./material-class-parameter.entity";

@Entity({ name: "material_class" })
export class MaterialClass extends BaseClassAbstract {
  @OneToMany(() => MaterialClassParameter, (p) => p.classRef)
  parameters!: MaterialClassParameter[];
}
