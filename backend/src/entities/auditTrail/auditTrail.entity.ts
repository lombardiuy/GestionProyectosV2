import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"; 

@Entity({ name: "audit_trail" })
@Index("idx_audit_entity", ["entity"])
@Index("idx_audit_entity_entityid", ["entity", "entityId"])
@Index("idx_audit_created", ["created"])
export class AuditTrail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  module!: string;

  @Column()
  entity!: string; 

  @Column()
  entityId!: number;

  
  @Column()
  version!: number;

  @Column()    
  action!: string; 

  @Column({ nullable: true })
  description!: string;

  @Column({ type: "nvarchar", length: "max" })
  changes!: string; 


  @Column()
  author!: string;

  @CreateDateColumn()
  created!: Date;

}
