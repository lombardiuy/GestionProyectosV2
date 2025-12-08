import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, VersionColumn, UpdateDateColumn, OneToMany } from "typeorm"; 
import {UserRole} from './UserRole.entity'



@Entity({name: 'user'})
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    name!: string;

    @Column({unique:true})
    username!: string;

    @Column({ nullable: false })
    password!: string;

    @Column({ nullable: false })
    hasProfilePicture!: boolean; //Si tengo foto de perfil es la ID del usuario.
    
    @Column({ nullable: false })
    active!: boolean;

    @Column({ nullable: false })
    suspended!: boolean;
 
    @ManyToOne(() => UserRole, userRole => userRole.users)
    public userRole!: UserRole;
 

    
    @VersionColumn()
    public version!:number;

    @CreateDateColumn()
    public created!: Date;

    @UpdateDateColumn()
    public updated!: Date;

   
}