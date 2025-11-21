import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
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

  @Column({ type: "int" })
  materialId!: number;

  @ManyToOne(() => Material, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "material_id" })
  material!: Material;

  @OneToMany(() => MaterialParameter, (p) => p.catalogueMaterial, { cascade: true })
  parameters!: MaterialParameter[];
}
