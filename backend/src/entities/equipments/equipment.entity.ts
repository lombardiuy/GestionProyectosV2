import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { EquipmentParameter } from "./equipment-parameter.entity";
import { Area } from "../areas/area.entity";
import { EquipmentClass } from "./equipment-class.entity";


@Entity({ name: "equipment" })
export class Equipment {
  @PrimaryGeneratedColumn()
  id!: number;

  
  @Column({ type: "nvarchar", length: 50, unique:true })
  code!: string;

  @Column({ type: "nvarchar", length: 255})
  name!: string;


  @Column({ type: "nvarchar", length: 255})
  material!: string;

  @Column({ type: "nvarchar", length: 255})
  operationalPrinciple!: string;

  @Column({ type: "nvarchar", length: 255})
  brand!: string;

  @Column({ type: "nvarchar", length: 255})
  model!: string;

  
  @Column({ type: "nvarchar", length: 255})
  capacity!: string;

  @Column()
  mobile!: boolean; 

  @Column()
  hasPicture!: boolean; 

  @Column()
  active!: boolean;

  @ManyToMany(() => Area, area => area.equipments)
  areas!: Area[];

  @ManyToOne(() => EquipmentClass, (c) => c.equipments, {nullable:false})
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
