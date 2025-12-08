import { Entity, PrimaryGeneratedColumn, Column, OneToMany, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { MaterialClass } from "./material-class.entity";

@Entity({ name: "material" })
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @OneToMany(() => MaterialClass, (c) => c.material, { cascade: true })
  classes!: MaterialClass[];

  @VersionColumn()
  public version!:number;
    
  @CreateDateColumn()
  public created!: Date;
    
  @UpdateDateColumn()
  public updated!: Date;

  
}
