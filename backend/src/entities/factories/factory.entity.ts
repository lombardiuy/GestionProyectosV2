import { Entity, PrimaryGeneratedColumn, Column, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { FactoryRoute } from "./factory-route.entity";


@Entity({ name: "factory" })
export class Factory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", unique:true, length: 255 })
  name!: string;

  @Column({ type: "nvarchar", length: 300})
  location!: string;

  @Column({ type: "nvarchar", length: 255})
  contact!: string;

  @Column()
  active!: boolean;

  @Column()
  hasProfilePicture!: boolean; 


  @OneToMany(() => FactoryRoute, route => route.factory)
  routes!: FactoryRoute[];

  
  @VersionColumn()
  public version!:number;
  
  @CreateDateColumn()
  public created!: Date;
  
  @UpdateDateColumn()
  public updated!: Date;
  

}
