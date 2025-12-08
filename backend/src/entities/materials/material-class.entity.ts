import { Entity, OneToMany, ManyToOne, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseClassAbstract } from "../shared/base-class.abstract";
import { MaterialClassParameter } from "./material-class-parameter.entity";
import { Material } from "./material.entity";

@Entity({ name: "material_class" })
export class MaterialClass extends BaseClassAbstract {
  @ManyToOne(() => Material, (m) => m.classes, { nullable: true, onDelete: "SET NULL" })
  material!: Material;

  @OneToMany(() => MaterialClassParameter, (p) => p.classRef, { cascade: true })
  parameters!: MaterialClassParameter[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;
}
