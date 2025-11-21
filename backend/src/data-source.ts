import { DataSource } from 'typeorm';
import 'dotenv/config';
import { AuditTrail } from './entities/auditTrail/auditTrail.entity';
import { User } from './entities/users/User.entity'; 
import { UserRole } from './entities/users/UserRole.entity';
import { UserRolePermission } from './entities/users/UserRolePermission.entity';

import { Factory } from './entities/factories/factory.entity';
import { FactoryRoute } from './entities/factories/factory-route.entity';

import { Area } from './entities/areas/area.entity';
import { AreaParameter } from './entities/areas/area-parameter.entity';
import { AreaClass } from './entities/areas/area-class.entity';
import { AreaClassParameter } from './entities/areas/area-class-parameter.entity';



import { Equipment } from './entities/equipments/equipment.entity';
import { EquipmentClass } from './entities/equipments/equipment-class.entity';
import { EquipmentClassParameter } from './entities/equipments/equipment-class-parameter.entity';
import { EquipmentParameter } from './entities/equipments/equipment-parameter.entity';
import { Material } from './entities/materials/material.entity';
import { CatalogueMaterial } from './entities/materials/catalogue-material.entity';
import { MaterialParameter } from './entities/materials/material-parameter.entity';
import { MaterialClass } from './entities/materials/material-class.entity';
import { MaterialClassParameter } from './entities/materials/material-class-parameter.entity';






export const AppDataSource = new DataSource({
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '1433'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [

    //1 - AuditTrail
    AuditTrail,

    //2- Users
    User, UserRole, UserRolePermission,

    //3 - Factories
    Factory,FactoryRoute,

    //4 - Areas

    Area, AreaParameter, AreaClass, AreaClassParameter,

    //5 - Equipments
    Equipment, EquipmentParameter, EquipmentClass, EquipmentClassParameter, 

    //6 - Materials

    CatalogueMaterial, Material, MaterialParameter, MaterialClass, MaterialClassParameter
   




  ],
  synchronize: true,
  options: {
    encrypt: false,
     instanceName: process.env.DB_INSTANCE_NAME, 
  },
});
