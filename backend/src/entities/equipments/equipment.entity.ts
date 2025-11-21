import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { EquipmentParameter } from "./equipment-parameter.entity";
import { Area } from "../areas/area.entity";

@Entity({ name: "equipment" })
export class Equipment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 100 })
  code!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  material!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  operationalPrinciple!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  brand!: string;

  @Column({ type: "nvarchar", length: 255, nullable: true })
  model!: string;

  // Relación con el area (opcional)
  @ManyToOne(() => Area, (a) => a.equipments, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "area_id" })
  area!: Area;

  @OneToMany(() => EquipmentParameter, (p) => p.equipment, { cascade: true })
  parameters!: EquipmentParameter[];
}
