import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { EquipmentParameter } from "./equipment-parameter.entity";
import { Area } from "../areas/area.entity";
import { EquipmentClass } from "./equipment-class.entity";


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

  @Column()
  hasPicture!: boolean; 

  @Column()
  active!: boolean;

  @ManyToOne(() => Area, (a) => a.equipments, { nullable: true, onDelete: "SET NULL" })
  area!: Area;

  @ManyToOne(() => EquipmentClass, (c) => c.equipments)
  equipmentClass!: EquipmentClass;

  @OneToMany(() => EquipmentParameter, (p) => p.equipment, { cascade: true })
  parameters!: EquipmentParameter[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;

  
}
