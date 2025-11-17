import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn, VersionColumn, UpdateDateColumn, OneToMany } from "typeorm"; 
import {UserRole} from './UserRole.entity'



@Entity({name: 'user'})
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({unique:true})
    username!: string;

    @Column()
    password!: string;

    @Column()
    hasProfilePicture!: boolean; //Si tengo foto de perfil es la ID del usuario.
    
    @Column()
    active!: boolean;

    @Column()
    suspended!: boolean;
 

    @VersionColumn()
    public version!:number;

    @CreateDateColumn()
    public created!: Date;

    @UpdateDateColumn()
    public updated!: Date;

  
    @ManyToOne(() => UserRole, userRole => userRole.users)
    public userRole!: UserRole;
 
   
}