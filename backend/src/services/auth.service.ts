import { AppDataSource } from '../data-source';
import { User } from '../entities/users/User.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';


const userRepository = AppDataSource.getRepository(User);

export const login = async (username: string, password: string): Promise<string> => {
   const user = await userRepository.findOne({
    where: { username },
    relations: ['userRole', 'userRole.userRolePermissions'],
  });


  if (!user) throw new Error('Usuario no encontrado');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Contraseña incorrecta');

  const { password: _, ...userWithoutPassword } = user;

  return jwt.sign(userWithoutPassword, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });
};


export const getDevToken = async (): Promise<string> => {

// Carga los permisos desde el JSON en la raíz del proyecto
const permissionsPath = path.resolve(__dirname, '../../../modules.json');
const permissionsData = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));




// Aplana los permisos en una lista simple: USER_CREATE, USER_VIEW, etc.
 const validPermissions = (permissionsData as any[]).flatMap(moduleEntry =>
  moduleEntry.permissions.map((p: any) => ({ permission: p.code }))
);



  if (process.env.FAKE_AUTH === 'true') {
    const fakeToken = {
      id: 0,
      name: "Usuario prueba",
      username: "testing",
      profilePicture: null,
      userRole: {
        name: 'admin',
        userRolePermissions: validPermissions
      },
      active: true,
    };
    

    console.log(fakeToken)
    return jwt.sign(fakeToken, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
  } else {
    throw new Error('Debe desactivar la autenticación primero!');
  }
};
