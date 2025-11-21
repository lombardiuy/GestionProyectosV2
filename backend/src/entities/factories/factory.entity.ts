import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { FactoryRoute } from "./factory-route.entity";
import { CatalogueMaterial } from "../materials/catalogue-material.entity";

@Entity({ name: "factory" })
export class Factory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 500, nullable: true })
  location!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  owner!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  contact!: string;

  @Column({ type: "int", nullable: true })
  levels!: number;

  // si querés que una factory tenga múltiples rutas
  @OneToMany(() => FactoryRoute, (r) => r.factories, { cascade: true })
  routes!: FactoryRoute[];

  // catálogo de materiales asociado a la factory
  @OneToMany(() => CatalogueMaterial, (cm) => cm /* no backref */, { cascade: true })
  catalogueMaterials!: CatalogueMaterial[];
}
