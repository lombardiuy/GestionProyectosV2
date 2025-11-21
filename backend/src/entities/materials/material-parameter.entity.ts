import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseParameterAbstract } from "../shared/base-parameter.abstract";
import { MaterialClassParameter } from "./material-class-parameter.entity";
import { CatalogueMaterial } from "./catalogue-material.entity";

@Entity({ name: "material_parameter" })
export class MaterialParameter extends BaseParameterAbstract {
  @ManyToOne(() => MaterialClassParameter, (cp) => cp.parameters, { onDelete: "SET NULL" })
  @JoinColumn({ name: "class_parameter_id" })
  classParameter!: MaterialClassParameter;

  // pertenece a un item del catálogo (CatalogueMaterial)
  @ManyToOne(() => CatalogueMaterial, (cm) => cm.parameters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "catalogue_material_id" })
  catalogueMaterial!: CatalogueMaterial;
}
