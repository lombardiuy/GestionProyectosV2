import { AppDataSource } from '../../data-source';
import { User } from '../../entities/users/User.entity';
import { UserRole } from '../../entities/users/UserRole.entity';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { registerInAuditTrail, detectModuleChanges } from './../auditTrail.service';
import { createEmptyDir } from './../file.service';
import { USER_ERRORS, ROLE_ERRORS, AUDIT_ACTIONS } from '../../messages/user.messages';

const userRepository = AppDataSource.getRepository(User);


/**
 * Obtiene todos los usuarios (sin password) con su rol.
 */
export const getAllUsers = async (): Promise<Partial<User>[]> => {
  try {
    const users = await userRepository.find({ relations: ['userRole'] });
    return users.map(({ password, ...rest }) => rest);
  } catch (error) {
    console.error(error);
    throw new Error(USER_ERRORS.NOT_FOUND);
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
 */
export const createUser = async (
  payload: { name: string; username: string; password: string; userRole: number; profilePicture: string },
  currentUsername: string
): Promise<Partial<User>> => {
  const { name, username, password, userRole, profilePicture } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(UserRole);

    const exists = await userRepo.findOneBy({ username });
    if (exists) throw new Error(USER_ERRORS.USERNAME_EXISTS);

    const role = await roleRepo.findOneBy({ id: userRole });
    if (!role) throw new Error(ROLE_ERRORS.NOT_FOUND);

    const hashed = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      name,
      username,
      password: hashed,
      profilePicture,
      active: false,
      suspended: false,
      userRole: role,
    });

    const saved = await userRepo.save(newUser);

    await createUserDirectories(saved.id);

    await registerInAuditTrail(
      {
        module: "Users",
        entity: 'User',
        entityId: saved.id,
        action: AUDIT_ACTIONS.Users.CREATE.action,
        changes: { username: { oldValue: null, newValue: saved.username } },
        description: AUDIT_ACTIONS.Users.CREATE.description,
        author: currentUsername,
        version: saved.version
      },
      manager
    );

    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Actualiza un usuario existente.
 */
export const updateUser = async (
  id: number,
  payload: { name?: string; username?: string; password?: string; userRole?: any; userRoleId?: number; active?: boolean; suspended?: boolean; profilePicture?: string },
  currentUsername: string
): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(UserRole);

    const user = await userRepo.findOne({ where: { id }, relations: ['userRole'] });
    if (!user) throw new Error(USER_ERRORS.NOT_FOUND);

    if (payload.username && payload.username !== user.username) {
      const exists = await userRepo.findOneBy({ username: payload.username });
      if (exists) throw new Error(USER_ERRORS.USERNAME_EXISTS);
    }

    let newRole = user.userRole;
    const candidateRoleId = typeof payload.userRole === 'number' ? payload.userRole : payload.userRoleId;
    if (!candidateRoleId && payload.userRole && typeof payload.userRole === 'object' && payload.userRole.id) {
      const role = await roleRepo.findOneBy({ id: payload.userRole.id });
      if (!role) throw new Error(ROLE_ERRORS.NOT_FOUND);
      newRole = role;
    } else if (candidateRoleId) {
      const role = await roleRepo.findOneBy({ id: candidateRoleId });
      if (!role) throw new Error(ROLE_ERRORS.NOT_FOUND);
      newRole = role;
    }

    const after: any = { ...user, ...payload, userRole: newRole };
    if (payload.password) after.password = payload.password;

    const changes = detectModuleChanges(user, after, {
      ignore: ["password", "createdAt", "updatedAt"],
      relations: ["userRole"],
    });

    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    Object.assign(user, after);

    if (payload.password) user.password = await bcrypt.hash(payload.password, 10);

    const saved = await userRepo.save(user);

    await registerInAuditTrail(
      {
        module: 'Users',
        entity: 'User',
        entityId: saved.id,
        action: AUDIT_ACTIONS.Users.UPDATE.action,
        changes,
        description: AUDIT_ACTIONS.Users.UPDATE.description,
        author: currentUsername,
        version: saved.version
      },
      manager
    );

    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Actualiza perfil del usuario.
 */
export const updateUserProfile = async (
  payload: { id: number; actualPassword?: string; newPassword?: string; profilePicture?: string },
  currentUsername: string
): Promise<Partial<User>> => {
  const { id, actualPassword, newPassword, profilePicture } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOne({ where: { id }, relations: ["userRole"] });
    if (!user) throw new Error(USER_ERRORS.NOT_FOUND);

    const after: any = { ...user };
    const passwordChanged = !(actualPassword === 'null' && newPassword === 'null');
    const profilePictureChanged = profilePicture != 'null';

    if (passwordChanged) {
      if (actualPassword === newPassword) throw new Error(USER_ERRORS.PASSWORD_SAME);
      const match = await bcrypt.compare(actualPassword!, user.password);
      if (!match) throw new Error(USER_ERRORS.PASSWORD_INVALID);
      after.password = await bcrypt.hash(newPassword!, 10);
    }

    if (profilePictureChanged) after.profilePicture = profilePicture;

    const changes = detectModuleChanges(user, after, { ignore: ["createdAt", "updatedAt", "userRole"], relations: [] });

    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    Object.assign(user, after);
    const saved = await userRepo.save(user);

    let action = AUDIT_ACTIONS.Users.PROFILE_UPDATE.action;
    let description = AUDIT_ACTIONS.Users.PROFILE_UPDATE.description;

    if (profilePictureChanged && !passwordChanged) {
      action = AUDIT_ACTIONS.Users.PROFILE_PICTURE_UPDATE.action;
      description = AUDIT_ACTIONS.Users.PROFILE_PICTURE_UPDATE.description;
    } else if (!profilePictureChanged && passwordChanged) {
      action = AUDIT_ACTIONS.Users.PASSWORD_CHANGE.action;
      description = AUDIT_ACTIONS.Users.PASSWORD_CHANGE.description;
    }

    await registerInAuditTrail({ module: 'Users', entity: "User", entityId: saved.id, action, changes, description, author: currentUsername, version: saved.version }, manager);

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
  currentUsername?: string
): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOne({ where: { id }, relations: ["userRole"] });
    if (!user) throw new Error(USER_ERRORS.NOT_FOUND);

    if (!newPassword || newPassword.trim().length === 0) throw new Error(USER_ERRORS.PASSWORD_REQUIRED);

    const before = { ...user };
    const after: any = { ...user, password: await bcrypt.hash(newPassword, 10), active: true };

    const changes = detectModuleChanges(before, after, { ignore: ["createdAt", "updatedAt", "userRole"], relations: [] });

    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    Object.assign(user, after);
    const saved = await userRepo.save(user);

    await registerInAuditTrail({
      module: 'Users',
      entity: "User",
      entityId: saved.id,
      action: AUDIT_ACTIONS.Users.PASSWORD_SET.action,
      changes,
      description: AUDIT_ACTIONS.Users.PASSWORD_SET.description,
      author: currentUsername || saved.username,
      version: saved.version,
    }, manager);

    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Resetea la contraseña al DEFAULT_PASSWORD y desactiva la cuenta (admin action)
 */
export const resetUserPassword = async (id: number, currentUsername: string): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOne({ where: { id }, relations: ["userRole"] });
    if (!user) throw new Error(USER_ERRORS.NOT_FOUND);

    const defaultPassword = process.env.DEFAULT_PASSWORD;
    if (!defaultPassword) throw new Error("DEFAULT_PASSWORD no está definido en el entorno.");

    const before = { ...user };
    const after: any = { ...user, password: await bcrypt.hash(defaultPassword, 10), active: false };

    const changes = detectModuleChanges(before, after, { ignore: ["createdAt", "updatedAt", "userRole"], relations: [] });

    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    Object.assign(user, after);
    const saved = await userRepo.save(user);

    await registerInAuditTrail({
      module: "Users",
      entity: "User",
      entityId: saved.id,
      action: AUDIT_ACTIONS.Users.PASSWORD_RESET.action,
      changes,
      description: AUDIT_ACTIONS.Users.PASSWORD_RESET.description,
      author: currentUsername,
      version: saved.version,
    }, manager);

    const { password: _, ...rest } = saved;
    return rest;
  });
};

/**
 * Alterna la suspensión del usuario
 */
export const suspensionUser = async (id: number, currentUsername: string): Promise<Partial<User>> => {
  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.getRepository(User);
    const user = await userRepo.findOne({ where: { id }, relations: ["userRole"] });
    if (!user) throw new Error(USER_ERRORS.NOT_FOUND);

    const before = { ...user };
    const after: any = { ...user, suspended: !user.suspended };

    const changes = detectModuleChanges(before, after, { ignore: ["createdAt", "updatedAt", "userRole"], relations: [] });

    if (Object.keys(changes).length === 0) {
      const { password: _, ...rest } = user;
      return rest;
    }

    Object.assign(user, after);
    const saved = await userRepo.save(user);

    await registerInAuditTrail({
      module: "Users",
      entity: "User",
      entityId: saved.id,
      action: after.suspended ? AUDIT_ACTIONS.Users.SUSPENSION.action : AUDIT_ACTIONS.Users.ACTIVATION.action,
      changes,
      description: after.suspended ? AUDIT_ACTIONS.Users.SUSPENSION.description : AUDIT_ACTIONS.Users.ACTIVATION.description,
      author: currentUsername,
      version: saved.version,
    }, manager);

    const { password: _, ...rest } = saved;
    return rest;
  });
};


export const createUserDirectories = async (userID: number) => {
  await createEmptyDir('users/user_' + userID);
};
