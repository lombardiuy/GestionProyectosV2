import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToMany } from "typeorm"; 
import { User } from "./User.entity";
import { UserRolePermission } from "./UserRolePermission";



@Entity({name: 'userRole'})
export class UserRole extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique:true})
    name!: string;

    @OneToMany(() => User, users => users.userRole)
    public users!: User[];

    @OneToMany(() => UserRolePermission, userRolePermissions => userRolePermissions.userRole, { cascade: true })
    public userRolePermissions!: UserRolePermission[];





   
}