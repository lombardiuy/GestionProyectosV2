import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"; 


@Entity()
export class AuditTrail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  entity!: string; // User, Unit, Equipment, Process...

  @Column()
  entityId!: number;

  @Column()
  action!: string; 

  @Column({ type: "nvarchar", length: "max" })
  changes!: string; 

  @Column()
  author!: string;

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn()
  date!: Date;

  @Column({ default: 1 })
  version!: number;
}
