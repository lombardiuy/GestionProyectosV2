import { AppDataSource } from '../data-source';
import { User } from '../entities/users/User.entity';
import { UserRole } from '../entities/users/UserRole.entity';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { UserRolePermission } from '../entities/users/UserRolePermission.entity';

const userRepository = AppDataSource.getRepository(User);
const userRolesRepository = AppDataSource.getRepository(UserRole);
const userRolePermissionRepository = AppDataSource.getRepository(UserRolePermission);

/**
 * Obtiene todos los usuarios (sin password) con su rol.
 */
export const getAllUsers = async (): Promise<Partial<User>[]> => {
  try {
    const users = await userRepository.find({ relations: ['userRole'] });
    return users.map(({ password, ...rest }) => rest);
  } catch (error) {
    console.error(error);
    throw new Error('No se pudieron obtener los usuarios');
  }
};

/**
 * Obtiene todos los roles con permisos.
 */
export const getUserRoles = async (): Promise<UserRole[]> => {
  try {
    return await userRolesRepository.find({ relations: ['userRolePermissions'] });
  } catch (error) {
    console.error(error);
    throw new Error('No se pudieron obtener los roles');
  }
};

/**
 * Busca un usuario por id (sin password).
 */
export const selectUserById = async (id: number): Promise<Partial<User> | null> => {
  try {
    const user = await userRepository.findOne({ where: { id }, relations: ['userRole'] });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Crea un usuario nuevo.
 * Recibe un objeto con shape validado por DTO: { name, username, password, userRoleId }
 */
export const create = async (payload: {
  name: string;
  username: string;
  password: string;
  userRoleId: number;
}): Promise<Partial<User>> => {
  const { name, username, password, userRoleId } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(UserRole);

    // Validaciones
    const exists = await userRepo.findOneBy({ username });
    if (exists) {
      throw new Error('El usuario ya existe');
    }

    const role = await roleRepo.findOneBy({ id: userRoleId });
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      name,
      username,
      password: hashed,
      hasProfilePicture: false,
      active: false,
      suspended: false,
      userRole: role,
    });

    const saved = await userRepo.save(newUser);
    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Actualiza un usuario existente.
 * Recibe un objeto parcial validado por DTO.
 */
export const update = async (
  id: number,
  payload: {
    name?: string;
    username?: string;
    password?: string;
    userRoleId?: number;
    active?: boolean;
    suspended?: boolean;
    hasProfilePicture?: boolean;
  }
): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(UserRole);

    // Buscar usuario
    const user = await userRepo.findOne({ where: { id }, relations: ['userRole'] });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Si viene username, verificar duplicado
    if (payload.username && payload.username !== user.username) {
      const exists = await userRepo.findOneBy({ username: payload.username });
      if (exists) {
        throw new Error('Ya existe otro usuario con ese nombre de usuario');
      }
    }

    // Si viene un rol, validar rol
    if (payload.userRoleId) {
      const role = await roleRepo.findOneBy({ id: payload.userRoleId });
      if (!role) {
        throw new Error('Rol no encontrado');
      }
      user.userRole = role;
    }

    // Actualizar campos simples si vienen
    if (payload.name !== undefined) user.name = payload.name;
    if (payload.username !== undefined) user.username = payload.username;
    if (payload.active !== undefined) user.active = payload.active;
    if (payload.suspended !== undefined) user.suspended = payload.suspended;
    if (payload.hasProfilePicture !== undefined)
      user.hasProfilePicture = payload.hasProfilePicture;

    // Si viene nueva contraseña → hashear
    if (payload.password) {
      user.password = await bcrypt.hash(payload.password, 10);
    }

    // Guardar
    const saved = await userRepo.save(user);

    // Quitar password al devolver
    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Actualiza perfil del usuario.
 * Se puede usar para:
 *  - cambiar contraseña (requiere actualPassword + newPassword)
 *  - cambiar hasProfilePicture (si se envía)
 *
 * payload: { id, actualPassword?, newPassword?, hasProfilePicture? }
 */
export const updateUserProfile = async (payload: {
  id: number;
  actualPassword?: string;
  newPassword?: string;
  hasProfilePicture?: boolean;
}): Promise<Partial<User>> => {
  const { id, actualPassword, newPassword, hasProfilePicture } = payload;

  const user = await userRepository.findOneBy({ id });
  if (!user) throw new Error('Usuario desconocido. Si el error persiste contacte al administrador.');

  // Si piden cambiar contraseña, ambos campos deben estar presentes
  if ((actualPassword && !newPassword) || (!actualPassword && newPassword)) {
    throw new Error('Para cambiar contraseña debe enviar actualPassword y newPassword.');
  }

  if (actualPassword && newPassword) {
    const match = await bcrypt.compare(actualPassword, user.password);
    if (!match) throw new Error('Contraseña actual incorrecta');
    user.password = await bcrypt.hash(newPassword, 10);
  }

  // Si envían hasProfilePicture, lo actualizamos (no es obligatorio)
  if (typeof hasProfilePicture === 'boolean') {
    user.hasProfilePicture = hasProfilePicture;
  }

  const saved = await userRepository.save(user);
  const { password: _, ...rest } = saved;
  return rest;
};

/**
 * Crea un rol con permisos (payload: { name, permissions: string[] })
 */
export const createUserRole = async (payload: { name: string; permissions: string[] }): Promise<UserRole> => {
  const { name, permissions } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    if (!name || name.trim() === '') throw new Error('Debe asignar un nombre al rol');
    if (!Array.isArray(permissions) || permissions.length === 0) throw new Error('Debe asignar al menos 1 permiso al rol');

    const existsUserRole = await userRoleRepo.findOneBy({ name });
    if (existsUserRole) throw new Error('Ya existe un rol con el mismo nombre');

    const savedUserRole = await userRoleRepo.save(userRoleRepo.create({ name }));

    const newPerms = permissions.map((code) =>
      userRolePermissionRepo.create({ permission: code, userRole: savedUserRole })
    );

    await userRolePermissionRepo.save(newPerms);

    return savedUserRole;
  });
};

/**
 * Actualiza un rol existente y sus permisos
 * payload: { id, name, permissions: string[] }
 */
export const updateUserRole = async (payload: { id: number; name?: string; permissions: string[] }): Promise<UserRole> => {
  const { id, name, permissions } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    const role = await userRoleRepo.findOne({ where: { id } });
    if (!role) throw new Error('Rol no encontrado');

    if (!Array.isArray(permissions) || permissions.length === 0) throw new Error('Debe asignar al menos 1 permiso al rol');

    if (name && name.trim() !== role.name) {
      // verificar duplicado por nombre
      const exists = await userRoleRepo.findOneBy({ name });
      if (exists && exists.id !== id) throw new Error('Ya existe un rol con el mismo nombre');
      role.name = name;
      await userRoleRepo.save(role);
    }

    // borrar permisos viejos del rol
    // obtenemos IDs y borramos (asegura compatibilidad con distintos drivers)
    const oldPerms = await userRolePermissionRepo.find({ where: { userRole: { id: role.id } as any } });
    if (oldPerms.length > 0) {
      const oldIds = oldPerms.map(p => p.id);
      await userRolePermissionRepo.delete(oldIds);
    }

    // crear y guardar permisos nuevos
    const newPerms = permissions.map((code) =>
      userRolePermissionRepo.create({ permission: code, userRole: role })
    );
    await userRolePermissionRepo.save(newPerms);

    // devolver rol con permisos actualizados
    return await userRoleRepo.findOne({ where: { id: role.id }, relations: ['userRolePermissions'] }) as UserRole;
  });
};

/**
 * Cambia la contraseña de un usuario (admin action)
 */
export const setUserPassword = async (id: number, newPassword: string): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('Usuario no encontrado.');

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.active = true;

    const updatedUser = await userRepo.save(user);
    const { password: _, ...rest } = updatedUser;
    return rest;
  });
};

/**
 * Resetea la contraseña al DEFAULT_PASSWORD y desactiva la cuenta (admin action)
 */
export const resetUserPassword = async (id: number): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('Usuario no encontrado.');

    const hashed = await bcrypt.hash(process.env.DEFAULT_PASSWORD!, 10);
    user.password = hashed;
    user.active = false;

    const updatedUser = await userRepo.save(user);
    const { password: _, ...rest } = updatedUser;
    return rest;
  });
};

/**
 * Alterna la suspensión del usuario
 */
export const suspensionUser = async (id: number): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOneBy({ id });
    if (!user) throw new Error('Usuario no encontrado.');

    user.suspended = !user.suspended;
    const updatedUser = await userRepo.save(user);
    const { password: _, ...rest } = updatedUser;
    return rest;
  });
};
