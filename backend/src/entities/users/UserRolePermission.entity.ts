import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, VersionColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"; 
import { UserRole } from "./UserRole.entity";




@Entity({name: 'userRolePermission'})
export class UserRolePermission extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    permission!:string;

    @ManyToOne(() => UserRole, userRole => userRole.userRolePermissions, { onDelete: "CASCADE" })
    public userRole!: UserRole;

    

    @VersionColumn()
    public version!:number;
        
    @CreateDateColumn()
    public created!: Date;
        
    @UpdateDateColumn()
    public updated!: Date;




   
}