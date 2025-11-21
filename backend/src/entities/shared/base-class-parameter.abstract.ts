import { PrimaryGeneratedColumn, Column } from "typeorm";

export abstract class BaseClassParameterAbstract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "nvarchar", length: 255 })
  name!: string;
}
