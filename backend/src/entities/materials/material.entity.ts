import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { MaterialClass } from "./material-class.entity";

@Entity({ name: "material" })
export class Material {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;

  @OneToMany(() => MaterialClass, (c) => c /* no backref needed here */, { cascade: true })
  classes!: MaterialClass[];
}
