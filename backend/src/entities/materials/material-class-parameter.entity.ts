import { Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseClassParameterAbstract } from "../shared/base-class-parameter.abstract";
import { MaterialClass } from "./material-class.entity";
import { MaterialParameter } from "./material-parameter.entity";

@Entity({ name: "material_class_parameter" })
export class MaterialClassParameter extends BaseClassParameterAbstract {
  @ManyToOne(() => MaterialClass, (c) => c.parameters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "material_class_id" })
  classRef!: MaterialClass;

  @OneToMany(() => MaterialParameter, (p) => p.classParameter)
  parameters!: MaterialParameter[];
}
