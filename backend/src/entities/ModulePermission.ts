import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm"; 
import { UserRole } from "./UserRole.entity";



@Entity({name: 'modulePermission'})
export class ModulePermission extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    module!: string;

    @Column()
    create!: boolean;

    @Column()
    read!: boolean;

    @Column()
    delete!: boolean;

    @Column()
    update!: boolean;

    @Column()
    requiresApproval!: boolean;

    @Column()
    approve!: boolean;

    
  @ManyToOne(() => UserRole, userRole => userRole.modulePermissions)
  public userRole!: UserRole;






   
}