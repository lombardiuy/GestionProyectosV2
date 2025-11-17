import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm"; 
import { UserRole } from "./UserRole.entity";




@Entity({name: 'userRolePermission'})
export class UserRolePermission extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    permission!:string;

    @ManyToOne(() => UserRole, userRole => userRole.userRolePermissions, { onDelete: "CASCADE" })
    public userRole!: UserRole;





   
}