import { DataSource } from 'typeorm';
import 'dotenv/config';
import { User } from './entities/users/User.entity'; 
import { UserRole } from './entities/users/UserRole.entity';
import { UserRolePermission } from './entities/users/UserRolePermission.entity';





export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [

    //1- Users
    User, UserRole, UserRolePermission
  ],
  synchronize: true,
  options: {
    encrypt: false,
     instanceName: process.env.DB_INSTANCE_NAME, 
  },
});
