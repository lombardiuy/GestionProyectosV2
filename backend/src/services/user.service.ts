import { AppDataSource } from '../data-source';
import { User } from '../entities/User.entity';
import { UserRole } from '../entities/UserRole.entity';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { UserRolePermission } from '../entities/UserRolePermission';
const userRepository = AppDataSource.getRepository(User);
const userRolesRepository = AppDataSource.getRepository(UserRole);

/**
 * Obtiene todos los usuarios con sus roles y permisos.
 */
export const getAllUsers = async (): Promise<Partial<User>[]> => {
  try {
    const users =  await userRepository.find({ relations: ['userRole'] });
    return users.map(({ password, ...rest }) => rest);

  } catch (error) {
    throw new Error('No se pudieron obtener los usuarios');
  }
};

/**
 * Obtiene todos los roles de usuario con sus permisos.
 */
export const getUserRoles = async (): Promise<UserRole[]> => {
  try {
    return await userRolesRepository.find({relations:['userRolePermissions']});
  } catch (error) {
    console.error(error)
    throw new Error('No se pudieron obtener los roles');
  }
};

/**
 * Busca un usuario por su ID.
 * @param id ID del usuario
 */
export const selectUserById = async (id: number): Promise<Partial<User> | null> => {
  try {
    const user =  await userRepository.findOne({where:{ id }, relations:['userRole']});

    if (!user) return null;
    
    const { password, ...rest } = user;

    return rest;
    
  } catch {
    return null;
  }
};

/**
 * Crea o actualiza un usuario.
 * @param user Datos del usuario
 */
export const create = async (user: User): Promise<User> => {
  try {
    // Verificar si el username ya existe (excepto si es el mismo usuario en actualización)
    const exists = await userRepository.findOneBy({ username: user.username });

    if ((exists && !user.id) || (exists && user.id !== exists.id)) {
      throw new Error('El usuario ya existe');
    }

    // Si la contraseña fue modificada o es creación, hashearla
    if (!exists || (exists && user.password && user.password !== '')) {
      const hashed = await bcrypt.hash(user.password, 10);
      user.password = hashed;
    } else {
      // Mantener contraseña original si no se modificó
      user.password = exists.password;
    }
    user.active = false;
    user.suspended = false;

    const createdUser = userRepository.create(user);
    return await userRepository.save(createdUser);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    throw error;
  }
};

/**
 * Crea un nuevo rol de usuario.
 * @param userRole Datos del rol
 */
export const createUserRole = async (userRole: UserRole, permissions: string[]): Promise<UserRole> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    if (userRole.name === '') {
        
      throw new Error('Debe asignar un nombre al rol');

    }

    if (permissions.length === 0) {
        throw new Error('Debe asignar al menos 1 permiso al rol');
    }

    // Validar duplicado
    const existsUserRole = await userRoleRepo.findOneBy({ name: userRole.name });
    if (existsUserRole && !userRole.id) {
      throw new Error('Ya existe un rol con el mismo nombre');
    }

    // Guardar primero el rol
    const savedUserRole = await userRoleRepo.save(userRole);

    // Crear permisos relacionados
    const newPerms = permissions.map((code) =>
      userRolePermissionRepo.create({ permission: code, userRole: savedUserRole })
    );

    await userRolePermissionRepo.save(newPerms);

    return savedUserRole;
  });
};

/**
 * Crea un nuevo rol de usuario.
 * @param userRole Datos del rol
 */
export const updateUserRole = async (userRole: UserRole, permissions: string[])=> {
  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

   
  // Borrar los permisos viejos
  await UserRolePermission.delete({ userRole: userRole });



    // Crear permisos relacionados
    const newPerms = permissions.map((code) =>
      userRolePermissionRepo.create({ permission: code, userRole: userRole })
    );

    await userRolePermissionRepo.save(newPerms);

 
  });
};






/**
 * Cambia la contraseña de un usuario.
 * @param id ID del usuario
 * @param newPassword Nueva contraseña
 */
export const setUserPassword = async (id: number, newPassword: string): Promise<User> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    const user = await userRepo.findOneBy({ id });
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.active = true;

    const updatedUser = await userRepo.save(user);
    return updatedUser;
  });
};


/**
 * Resetea la contraseña de un usuario.
 * @param id ID del usuario
 */
export const resetUserPassword = async (id: number): Promise<User> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    const user = await userRepo.findOneBy({ id });
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    const hashed = await bcrypt.hash(process.env.DEFAULT_PASSWORD!, 10);
    user.password = hashed;
    user.active = false;


    const updatedUser = await userRepo.save(user);
    return updatedUser;
  });
};


/**
 * Suspende Usuario
 * @param id ID del usuario
 */
export const suspensionUser = async (id: number): Promise<User> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    const user = await userRepo.findOneBy({ id });
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }


    user.suspended =  !user.suspended;

    const updatedUser = await userRepo.save(user);
    return updatedUser;
  });
};




