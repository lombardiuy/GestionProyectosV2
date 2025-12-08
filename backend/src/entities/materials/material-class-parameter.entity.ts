import { Entity, ManyToOne, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseClassParameterAbstract } from "../shared/base-class-parameter.abstract";
import { MaterialClass } from "./material-class.entity";
import { MaterialParameter } from "./material-parameter.entity";

@Entity({ name: "material_class_parameter" })
export class MaterialClassParameter extends BaseClassParameterAbstract {
  @ManyToOne(() => MaterialClass, (c) => c.parameters, { onDelete: "CASCADE" })
  classRef!: MaterialClass;

  @OneToMany(() => MaterialParameter, (p) => p.classParameter, { cascade: true })
  parameters!: MaterialParameter[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;
}
