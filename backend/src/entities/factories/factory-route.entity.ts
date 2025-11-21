import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Factory } from "./factory.entity";
import { Area } from "../areas/area.entity";

@Entity({ name: "factory_route" })
export class FactoryRoute {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 1000, nullable: true })
  description!: string;

  @OneToMany(() => Factory, (f) => f.routes)
  factories!: Factory[];

  // opcional: áreas asociadas a la ruta
  @OneToMany(() => Area, (a) => a.route)
  areas!: Area[];
}
