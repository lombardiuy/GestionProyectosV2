import { Entity, ManyToOne, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseParameterAbstract } from "../shared/base-parameter.abstract";
import { MaterialClassParameter } from "./material-class-parameter.entity";
import { CatalogueMaterial } from "./catalogue-material.entity";

@Entity({ name: "material_parameter" })
export class MaterialParameter extends BaseParameterAbstract {
  @ManyToOne(() => MaterialClassParameter, (cp) => cp.parameters, { nullable: true, onDelete: "SET NULL" })
  classParameter!: MaterialClassParameter;

  @ManyToOne(() => CatalogueMaterial, (cm) => cm.parameters, { onDelete: "CASCADE" })
  catalogueMaterial!: CatalogueMaterial;

  @VersionColumn()
   public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;
}
