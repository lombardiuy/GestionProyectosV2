import { PrimaryGeneratedColumn, Column } from "typeorm";

export abstract class BaseClassAbstract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;
}
