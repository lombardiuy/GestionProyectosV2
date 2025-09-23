import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToMany } from "typeorm"; 
import { User } from "./User.entity";
import { ModulePermission } from "./ModulePermission";


@Entity({name: 'userRole'})
export class UserRole extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique:true})
    name!: string;

    @OneToMany(() => User, users => users.userRole)
    public users!: User[];

    @OneToMany(() => ModulePermission, modulePermission => modulePermission.userRole, {cascade:true})
    public modulePermissions!: ModulePermission[];



   
}