import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Factory } from "../factories/factory.entity";
import { Area } from "../areas/area.entity";

@Entity({ name: "factory_route" })
export class FactoryRoute {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 255 })
  description!: string;

  @Column()
  active!: boolean;

  @ManyToOne(() => Factory, factory => factory.routes, { nullable: false })
  factory!: Factory;

  @ManyToMany(() => Area, area => area.routes)
  areas!: Area[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;


}
