import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn  } from "typeorm";
import { Material } from "./material.entity";
import { MaterialParameter } from "./material-parameter.entity";


@Entity({ name: "catalogue_material" })
export class CatalogueMaterial {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 100 })
  code!: string;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  provider!: string;

  @ManyToOne(() => Material, (m) => m.classes, { nullable: true, onDelete: "SET NULL" })
  material!: Material;

  @OneToMany(() => MaterialParameter, (p) => p.catalogueMaterial, { cascade: true })
  parameters!: MaterialParameter[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;

}
