import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Factory } from "../factories/factory.entity";
import { FactoryRoute } from "../factories/factory-route.entity";
import { AreaParameter } from "./area-parameter.entity";
import { Equipment } from "../equipments/equipment.entity";
import { AreaClass } from "./area-class.entity";


@Entity({ name: "area" })
export class Area {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 255 })
  code!: string;

  @Column()
  active!: boolean;


  @ManyToOne(() => AreaClass, (c) => c.areas)
  areaClass!: AreaClass;

  @ManyToMany(() => FactoryRoute, route => route.areas)
  @JoinTable({
    name: "area_factory_route",
    joinColumn: { name: "area_id" },
    inverseJoinColumn: { name: "route_id" }
  })
  routes!: FactoryRoute[];

  @OneToMany(() => AreaParameter, p => p.area)
  parameters!: AreaParameter[];

  @OneToMany(() => Equipment, e => e.area)
  equipments!: Equipment[];

    @VersionColumn()
    public version!:number;
    
    @CreateDateColumn()
    public created!: Date;
    
    @UpdateDateColumn()
    public updated!: Date;
}
