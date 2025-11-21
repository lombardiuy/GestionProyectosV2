import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { AreaParameter } from "./area-parameter.entity";
import { Equipment } from "../equipments/equipment.entity";
import { FactoryRoute } from "../factories/factory-route.entity";

@Entity({ name: "area" })
export class Area {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 100 })
  code!: string;

  @Column({ type: "int", nullable: true })
  routeId!: number;

  @ManyToOne(() => FactoryRoute, (r) => r.areas, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "route_id" })
  route!: FactoryRoute;

  @OneToMany(() => AreaParameter, (p) => p.area, { cascade: true })
  parameters!: AreaParameter[];

  @OneToMany(() => Equipment, (e) => e.area, { cascade: true })
  equipments!: Equipment[];
}
