import { AppDataSource } from '../data-source';
import { User } from '../entities/users/User.entity';
import { UserRole } from '../entities/users/UserRole.entity';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { UserRolePermission } from '../entities/users/UserRolePermission.entity';
import { registerInAuditTrail, detectModuleChanges } from './auditTrail.service';


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
},  currentUsername: string // <-- el usuario logueado 
): Promise<Partial<User>> => {
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

     // Registrar en auditTrail dentro de la misma transacción
    await registerInAuditTrail(
      {
        entity: 'Usuarios',
        entityId: saved.id,
        action: 'CREAR',
        changes: {message: 'Nuevo usuario: '+ saved.username + " Rol: "+saved.userRole.name},
        description: 'Versión original.',
        author: currentUsername,
        version:saved.version
       
      },
      manager // pasamos el manager para que sea parte de la misma transacción
    );


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
    userRole?: any;
    active?: boolean;
    suspended?: boolean;
    hasProfilePicture?: boolean;
  },  currentUsername: string // <-- el usuario logueado 
): Promise<Partial<User>> => {


  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(UserRole);

    // Buscar usuario
    const user = await userRepo.findOne({ where: { id }, relations: ['userRole'] });
    if (!user) throw new Error('Usuario no encontrado');
    

    // Si viene username, verificar duplicado
    if (payload.username && payload.username !== user.username) {
      const exists = await userRepo.findOneBy({ username: payload.username });
      if (exists) throw new Error('Ya existe otro usuario con ese nombre de usuario');
      
    }

       // Procesar rol
    let newRole = user.userRole;

    // Si viene un rol, validar rol
    if (payload.userRole) {
      const role = await roleRepo.findOneBy({ id: payload.userRole });
      if (!role) throw new Error('Rol no encontrado');
      

      //Asigno el objeto completo
       newRole = role;
    }

       // Construir objeto "after"
    const after = {
      ...user,
      ...payload,
      userRole: newRole,
    };

      // Detectar cambios genéricos
    const changes = detectModuleChanges(user, after, {
      ignore: ["password", "createdAt", "updatedAt"],
      relations: ["userRole"],
    });

     // Asignar valores actualizados
    Object.assign(user, after);

    // Hashear contraseña si vino
    if (payload.password) {
      user.password = await bcrypt.hash(payload.password, 10);
    }

    const saved = await userRepo.save(user);

         // Registrar en auditTrail dentro de la misma transacción
    await registerInAuditTrail(
      {
        entity: 'Usuarios',
        entityId: saved.id,
        action: 'ACTUALIZAR',
        changes:changes,
        description: "Actualización de configuración de usuario. Ver detalle en cambios.",
        author: currentUsername,
        version:saved.version
       
      },
      manager // pasamos el manager para que sea parte de la misma transacción
    );

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
export const updateUserProfile = async (
  payload: {
    id: number;
    actualPassword?: string;
    newPassword?: string;
    hasProfilePicture?: boolean;
  },
  currentUsername: string
): Promise<Partial<User>> => {

  const { id, actualPassword, newPassword, hasProfilePicture } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    // Buscar usuario
    const user = await userRepo.findOne({
      where: { id },
      relations: ["userRole"], // solo por consistencia, no se usa pero mantiene estructura estándar
    });

    if (!user) {
      throw new Error('Usuario desconocido. Si el error persiste contacte al administrador.');
    }

    // Validación de cambio de contraseña
    if ((actualPassword && !newPassword) || (!actualPassword && newPassword)) {
      throw new Error('Para cambiar la contraseña debe enviar actualPassword y newPassword.');
    }

    // Crear objeto AFTER (clonamos user para comparar)
    const after: any = { ...user };

    // Procesar cambio de contraseña
    if (actualPassword && newPassword) {
      const match = await bcrypt.compare(actualPassword, user.password);
      if (!match) throw new Error('Contraseña actual incorrecta');

      after.password = await bcrypt.hash(newPassword, 10);
    }

    // Procesar cambio de foto de perfil
    if (typeof hasProfilePicture === 'boolean') {
      after.hasProfilePicture = hasProfilePicture;
    }

    // Detectar cambios
    const changes = detectModuleChanges(user, after, {
      ignore: ["createdAt", "updatedAt", "userRole"], 
      relations: [], // esta función no afecta roles aquí
    });

    // Si no hubo cambios, evitar guardar y evitar audit vacío
    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    // Guardar cambios reales
    Object.assign(user, after);
    const saved = await userRepo.save(user);

    // Registrar auditoría dentro de la misma transacción
    await registerInAuditTrail(
      {
        entity: "Usuarios",
        entityId: saved.id,
        action: "ACTUALIZAR",
        changes: changes,
        description: "Actualización de perfil de usuario. Ver detalle en cambios.",
        author: currentUsername,
        version: saved.version
      },
      manager
    );

    // Quitar password del retorno
    const { password: _, ...rest } = saved;
    return rest;
  });
};


/**
 * Cambia la contraseña de un usuario (admin action)
 */
export const setUserPassword = async (
  id: number,
  newPassword: string,
  currentUsername: string
): Promise<Partial<User>> => {

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    // Buscar usuario
    const user = await userRepo.findOne({
      where: { id },
      relations: ["userRole"], // consistente con updateUserProfile
    });

    if (!user) {
      throw new Error('Usuario desconocido. Si el error persiste contacte al administrador.');
    }

    if (!newPassword || newPassword.trim().length === 0) {
      throw new Error("Debe enviar una nueva contraseña válida.");
    }

    // BEFORE (estado actual)
    const before = { ...user };

    // AFTER (nuevo estado)
    const after: any = { ...user };
    after.password = await bcrypt.hash(newPassword, 10);
    after.active = true;

    // Detectar cambios reales
    const changes = detectModuleChanges(before, after, {
      ignore: ["createdAt", "updatedAt", "userRole"],
      relations: [],
    });

    // Si no hubo cambios, no guardar
    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    // Guardar cambios
    Object.assign(user, after);
    const saved = await userRepo.save(user);

    // Registrar auditoría
    await registerInAuditTrail(
      {
        entity: "Usuarios",
        entityId: saved.id,
        action: "ACTUALIZAR",
        changes: changes,
        description: "Actualización de contraseña del usuario. Ver detalle en cambios.",
        author: currentUsername,
        version: saved.version,
      },
      manager
    );

    // Retornar sin password
    const { password: _, ...rest } = saved;
    return rest;
  });
};


/**
 * Resetea la contraseña al DEFAULT_PASSWORD y desactiva la cuenta (admin action)
 */
export const resetUserPassword = async (
  id: number,
  currentUsername: string
): Promise<Partial<User>> => {

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    // Buscar usuario
    const user = await userRepo.findOne({
      where: { id },
      relations: ["userRole"], // consistente con el resto del módulo
    });

    if (!user) {
      throw new Error('Usuario desconocido. Si el error persiste contacte al administrador.');
    }

    const defaultPassword = process.env.DEFAULT_PASSWORD;
    if (!defaultPassword) {
      throw new Error("DEFAULT_PASSWORD no está definido en el entorno.");
    }

    // BEFORE
    const before = { ...user };

    // AFTER
    const after: any = { ...user };
    after.password = await bcrypt.hash(defaultPassword, 10);
    after.active = false;

    // Detectar cambios
    const changes = detectModuleChanges(before, after, {
      ignore: ["createdAt", "updatedAt", "userRole"],
      relations: [],
    });

    // Si no hubo cambios, evitar registrar auditoría
    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    // Guardar cambios
    Object.assign(user, after);
    const saved = await userRepo.save(user);

    // Registrar auditoría
    await registerInAuditTrail(
      {
        entity: "Usuarios",
        entityId: saved.id,
        action: "RESETEAR_PASSWORD",
        changes: changes,
        description: "Reset de contraseña a valor por defecto. Ver detalle en cambios.",
        author: currentUsername,
        version: saved.version,
      },
      manager
    );

    // Quitar password del retorno
    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Alterna la suspensión del usuario
 */
export const suspensionUser = async (
  id: number,
  currentUsername: string
): Promise<Partial<User>> => {

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);

    // Buscar usuario
    const user = await userRepo.findOne({
      where: { id },
      relations: ["userRole"], // consistencia con el módulo
    });

    if (!user) {
      throw new Error('Usuario desconocido. Si el error persiste contacte al administrador.');
    }

    // BEFORE
    const before = { ...user };

    // AFTER (invertir suspensión)
    const after: any = { ...user };
    after.suspended = !user.suspended;

    // Detectar cambios
    const changes = detectModuleChanges(before, after, {
      ignore: ["createdAt", "updatedAt", "userRole"],
      relations: [],
    });

    // Si no hubo cambios, no guardar ni auditar
    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    // Guardar cambios
    Object.assign(user, after);
    const saved = await userRepo.save(user);

    // Registrar auditoría
    await registerInAuditTrail(
      {
        entity: "Usuarios",
        entityId: saved.id,
        action: user.suspended ? "SUSPENDER_USUARIO" : "REACTIVAR_USUARIO",
        changes: changes,
        description: user.suspended
          ? "Suspensión de usuario. Ver detalle en cambios."
          : "Reactivación  de usuario. Ver detalle en cambios.",
        author: currentUsername,
        version: saved.version,
      },
      manager
    );

    // Retornar sin password
    const { password: _, ...rest } = saved;
    return rest;
  });
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
