import { AppDataSource } from '../data-source';
import { User } from '../entities/users/User.entity';
import { UserRole } from '../entities/users/UserRole.entity';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { UserRolePermission } from '../entities/users/UserRolePermission.entity';
import { registerInAuditTrail, detectModuleChanges } from './auditTrail.service';
import { createEmptyDir} from './file.service';

const userRepository = AppDataSource.getRepository(User);
const userRolesRepository = AppDataSource.getRepository(UserRole);


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
export const createUser = async (payload: {
  name: string;
  username: string;
  password: string;
  userRole: number;
  hasProfilePicture:boolean;
},  currentUsername: string // <-- el usuario logueado 
): Promise<Partial<User>> => {
  const { name, username, password, userRole, hasProfilePicture } = payload;

 

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(UserRole);

    // Validaciones
    const exists = await userRepo.findOneBy({ username });
    if (exists) {
      throw new Error('El usuario ya existe');
    }

    
    const role = await roleRepo.findOneBy({ id: userRole });
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    const hashed = await bcrypt.hash(password, 10);

 
    const newUser = userRepo.create({
      name,
      username,
      password: hashed,
      hasProfilePicture,
      active: false,
      suspended: false,
      userRole: role,
    });

   

    const saved = await userRepo.save(newUser);

    await createUserDirectories(saved.id);
   

    // ✅ CORRECCIÓN: Normalizar "changes" para crear usuario (usar key 'username' en lugar de 'user')
    await registerInAuditTrail(
      {
        module:"Users",
        entity: 'User',
        entityId: saved.id,
        action: 'USER_CREATE',
        changes: { username: { oldValue: null, newValue: saved.username } }, // ✅ CORRECCIÓN
        description: 'Versión original.',
        author: currentUsername,
        version: saved.version
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
 *
 * Nota: payload.userRole puede ser:
 *  - undefined (no cambiar)
 *  - número (id del rol) OR objeto UserRole (en cuyo caso se toma su id)
 *
 * Mantengo compatibilidad con el uso previo, pero lo documento y lo manejo de forma robusta.
 */
export const updateUser = async (
  id: number,
  payload: {
    name?: string;
    username?: string;
    password?: string;
    userRole?: any; // puede ser id o userRoleId
    userRoleId?: number; // alternativa explícita
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

    // ------------------------------------------------------------
    // Procesar rol (aceptamos payload.userRole o payload.userRoleId)
    // ------------------------------------------------------------
    let newRole = user.userRole;

    const candidateRoleId = typeof payload.userRole === 'number' ? payload.userRole : payload.userRoleId;
    // Si viene userRole como objeto con id
    if (!candidateRoleId && payload.userRole && typeof payload.userRole === 'object' && payload.userRole.id) {
      // ✅ CORRECCIÓN: aceptar objeto rol como payload (backwards compatibility)
      // (ej: payload.userRole = { id: 3, name: 'X' })
      const role = await roleRepo.findOneBy({ id: payload.userRole.id });
      if (!role) throw new Error('Rol no encontrado');
      newRole = role;
    } else if (candidateRoleId) {
      const role = await roleRepo.findOneBy({ id: candidateRoleId });
      if (!role) throw new Error('Rol no encontrado');
      newRole = role;
    }

    // ------------------------------------------------------------
    // Construir objeto "after" (clonamos user y aplicamos payload)
    // ------------------------------------------------------------
    const after: any = {
      ...user,
      ...payload,
      userRole: newRole,
    };

    // Si vino password la ponemos en after en forma clavada (se hashará más abajo)
    if (payload.password) {
      // no guardamos texto plano en DB; solo lo dejamos en 'after' como indicación de cambio
      after.password = payload.password;
    }

    // Detectar cambios genéricos
    const changes = detectModuleChanges(user, after, {
      // ✅ CORRECCIÓN: asegurarnos que cambios en userRole queden detectados auditablemente.
      ignore: ["password", "createdAt", "updatedAt"],
      relations: ["userRole"],
    });

    // Si no hubo cambios -> evitar guardar y evitar audit vacío
    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

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
        module:'Users',
        entity: 'User',
        entityId: saved.id,
        action: 'USER_UPDATE',
        changes: changes,
        description: "Actualización de configuración de usuario.",
        author: currentUsername,
        version: saved.version
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
        module:'Users',
        entity: "User",
        entityId: saved.id,
        action: "USER_PROFILE_UPDATE",
        changes: changes,
        description: "Actualización de perfil de usuario.",
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
 *
 * ✅ CORRECCIÓN: ahora recibe currentUsername para registrar correctamente el autor en auditTrail.
 */
export const setUserPassword = async (
  id: number,
  newPassword: string,
  currentUsername?: string // ✅ CORRECCIÓN: se agregó este parámetro
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

    // ✅ CORRECCIÓN: usar currentUsername como author (antes se usaba saved.username por error)
    await registerInAuditTrail(
      {
        module:'Users',
        entity: "User",
        entityId: saved.id,
        action: "USER_PASSWORD_SET",
        changes: changes,
        description: "Actualización de contraseña del usuario. Ver detalle en cambios.",
        author: currentUsername || saved.username, // ✅ CORRECCIÓN
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
        module:"Users",
        entity: "User",
        entityId: saved.id,
        action: "USER_PASSWORD_RESET",
        changes: changes,
        description: "Reset de contraseña.",
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

    // ✅ CORRECCIÓN: usar el estado AFTER para decidir la acción de auditoría (antes se usaba el estado ANTERIOR)
    await registerInAuditTrail(
      {
        module:"Users",
        entity: "User",
        entityId: saved.id,
        action: after.suspended ? "USER_SUSPENSION" : "USER_ACTIVATION", // ✅ CORRECCIÓN
        changes: changes,
        description: after.suspended
          ? "Suspensión de usuario."
          : "Reactivación de usuario.",
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
export const createUserRole = async (
  payload: { name: string; permissions: string[] },
  currentUsername: string
): Promise<UserRole> => {

  const { name, permissions } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    // Validaciones
    if (!name || name.trim() === '') {
      throw new Error('Debe asignar un nombre al rol');
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error('Debe asignar al menos 1 permiso al rol');
    }

    const existsUserRole = await userRoleRepo.findOneBy({ name });
    if (existsUserRole) {
      throw new Error('Ya existe un rol con el mismo nombre');
    }

    // Crear el rol
    const newRole = userRoleRepo.create({ name });
    const savedUserRole = await userRoleRepo.save(newRole);

    // Crear permisos
    const newPerms = permissions.map((code) =>
      userRolePermissionRepo.create({
        permission: code,
        userRole: savedUserRole
      })
    );

    await userRolePermissionRepo.save(newPerms);

    // ✅ CORRECCIÓN: Normalizar "changes" en creación de rol (usar 'name' en lugar de 'user')
    await registerInAuditTrail(
      {
        module: "Users",
        entity: "UserRole",
        entityId: savedUserRole.id,
        action: "USER_ROLE_CREATE",
        changes: { name: { oldValue: null, newValue: savedUserRole.name } }, // ✅ CORRECCIÓN
        description: "Versión original.",
        author: currentUsername,
        version: savedUserRole.version,
      },
      manager
    );

    return savedUserRole;
  });
};


/**
 * Actualiza un rol existente y sus permisos
 * payload: { id, name, permissions: string[] }
 *
 * ✅ CORRECCIÓN: ahora compara permisos y solo recrea si realmente cambian.
 * También usa before/after y detectModuleChanges como en el resto del servicio.
 */
export const updateUserRole = async (
  payload: { id: number; name?: string; permissions: string[] },
  currentUsername: string
): Promise<UserRole> => {

  const { id, name, permissions } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    // Buscar rol
    const role = await userRoleRepo.findOne({
      where: { id },
      relations: ["userRolePermissions"],
    });

    if (!role) throw new Error("Rol no encontrado");

    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error("Debe asignar al menos 1 permiso al rol");
    }

    // BEFORE (estado original)
    const before = {
      name: role.name,
      permissions: role.userRolePermissions.map((p) => p.permission),
    };

    // AFTER (armamos el estado final ideal sin tocar DB todavía)
    const after: any = {
      name: before.name,
      permissions: [...before.permissions],
    };

    // 🔄 CAMBIO DE NOMBRE (si corresponde)
    if (name && name.trim() !== "" && name.trim() !== role.name) {
      // ✅ CORRECCIÓN: validar nombre duplicado ANTES de aplicarlo
      const exists = await userRoleRepo.findOneBy({ name: name.trim() });
      if (exists && exists.id !== id) {
        throw new Error("Ya existe un rol con el mismo nombre");
      }
      after.name = name.trim();
    }

    // 🔄 CAMBIO DE PERMISOS (valor final)
    after.permissions = [...permissions];

    // --- Detectar cambios usando detectModuleChanges ---
    const changes = detectModuleChanges(before, after, {
      ignore: [],
      relations: [],
    });

    // Si no hubo cambios → no auditar ni modificar la BD
    if (Object.keys(changes).length === 0) {
      return await userRoleRepo.findOne({
        where: { id: role.id },
        relations: ["userRolePermissions"],
      }) as UserRole;
    }

    // ------------------------
    // Aplicar cambios en BD
    // ------------------------

   

      role.version++;

     await userRoleRepo.save(role);

    // Comparar permisos de forma estable (ordenadas)
    const sortArr = (a: string[]) => a.slice().sort();
    const permsSame = JSON.stringify(sortArr(before.permissions)) === JSON.stringify(sortArr(after.permissions));

    if (!permsSame) {
      // ✅ CORRECCIÓN: solo borrar/crear si realmente cambiaron los códigos de permiso
      const oldPerms = await userRolePermissionRepo.find({
        where: { userRole: { id: role.id } },
      });

      if (oldPerms.length > 0) {
        await userRolePermissionRepo.delete(oldPerms.map((p) => p.id));
      }

      const newPermissionsEntities = after.permissions.map((code:any) =>
        userRolePermissionRepo.create({ permission: code, userRole: role })
      );



      await userRolePermissionRepo.save(newPermissionsEntities);
    }

    // Registrar en AuditTrail
    await registerInAuditTrail(
      {
        module: "Users",
        entity: "UserRole",
        entityId: role.id,
        action: "USER_ROLE_UPDATE",
        changes: changes,
        description: "Actualización de rol por cambio de permisos.",
        author: currentUsername,
        version: role.version,
      },
      manager
    );

    // Devolver rol actualizado
    return await userRoleRepo.findOne({
      where: { id: role.id },
      relations: ["userRolePermissions"],
    }) as UserRole;
  });




};

export const createUserDirectories = async (userID:number) => {
    await createEmptyDir('users/user_'+userID);

};


