import { PrimaryGeneratedColumn, Column } from "typeorm";

export abstract class BaseParameterAbstract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;
}
