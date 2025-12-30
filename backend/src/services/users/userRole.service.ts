import { AppDataSource } from '../../data-source';
import { UserRole } from '../../entities/users/UserRole.entity';
import 'dotenv/config';
import { UserRolePermission } from '../../entities/users/UserRolePermission.entity';
import { registerInAuditTrail, detectModuleChanges } from './../auditTrail.service';

import { ROLE_ERRORS, AUDIT_ACTIONS } from '../../messages/user.messages';


const userRolesRepository = AppDataSource.getRepository(UserRole);


/**
 * Obtiene todos los roles con permisos.
 */
export const getUserRoles = async (): Promise<UserRole[]> => {
  try {
    return await userRolesRepository.find({ relations: ['userRolePermissions'] });
  } catch (error) {
    console.error(error);
    throw new Error(ROLE_ERRORS.NOT_FOUND);
  }
};

/**
 * Crea un rol con permisos
 */
export const createUserRole = async (
  payload: { name: string; permissions: string[] },
  currentUsername: string
): Promise<UserRole> => {
  const { name, permissions } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    if (!name || name.trim() === '') throw new Error(ROLE_ERRORS.NAME_EXISTS);
    if (!Array.isArray(permissions) || permissions.length === 0) throw new Error(ROLE_ERRORS.PERMISSIONS_EMPTY);

    const existsUserRole = await userRoleRepo.findOneBy({ name });
    if (existsUserRole) throw new Error(ROLE_ERRORS.NAME_EXISTS);

    const newRole = userRoleRepo.create({ name });
    const savedUserRole = await userRoleRepo.save(newRole);

    const newPerms = permissions.map(code => userRolePermissionRepo.create({ permission: code, userRole: savedUserRole }));
    await userRolePermissionRepo.save(newPerms);

    await registerInAuditTrail({
      module: "Users",
      entity: "UserRole",
      entityId: savedUserRole.id,
      action: AUDIT_ACTIONS.Roles.CREATE.action,
      changes: { name: { oldValue: null, newValue: savedUserRole.name } },
      description: AUDIT_ACTIONS.Roles.CREATE.description,
      author: currentUsername,
      version: savedUserRole.version,
    }, manager);

    return savedUserRole;
  });
};

/**
 * Actualiza un rol existente y sus permisos
 */
export const updateUserRole = async (
  payload: { id: number; name?: string; permissions: string[] },
  currentUsername: string
): Promise<UserRole> => {
  const { id, name, permissions } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const userRoleRepo = manager.getRepository(UserRole);
    const userRolePermissionRepo = manager.getRepository(UserRolePermission);

    const role = await userRoleRepo.findOne({ where: { id }, relations: ["userRolePermissions"] });
    if (!role) throw new Error(ROLE_ERRORS.NOT_FOUND);
    if (!Array.isArray(permissions) || permissions.length === 0) throw new Error(ROLE_ERRORS.PERMISSIONS_EMPTY);

    const before = { name: role.name, permissions: role.userRolePermissions.map(p => p.permission) };
    const after: any = { name: before.name, permissions: [...permissions] };

    if (name && name.trim() !== "" && name.trim() !== role.name) {
      const exists = await userRoleRepo.findOneBy({ name: name.trim() });
      if (exists && exists.id !== id) throw new Error(ROLE_ERRORS.NAME_EXISTS);
      after.name = name.trim();
    }

    const changes = detectModuleChanges(before, after, { ignore: [], relations: [] });
    if (Object.keys(changes).length === 0) return await userRoleRepo.findOne({ where: { id }, relations: ["userRolePermissions"] }) as UserRole;

    role.version++;
    await userRoleRepo.save(role);

    const sortArr = (a: string[]) => a.slice().sort();
    const permsSame = JSON.stringify(sortArr(before.permissions)) === JSON.stringify(sortArr(after.permissions));
    if (!permsSame) {
      const oldPerms = await userRolePermissionRepo.find({ where: { userRole: { id: role.id } } });
      if (oldPerms.length > 0) await userRolePermissionRepo.delete(oldPerms.map(p => p.id));
      const newPermissionsEntities = after.permissions.map((code: any) => userRolePermissionRepo.create({ permission: code, userRole: role }));
      await userRolePermissionRepo.save(newPermissionsEntities);
    }

    await registerInAuditTrail({
      module: "Users",
      entity: "UserRole",
      entityId: role.id,
      action: AUDIT_ACTIONS.Roles.UPDATE.action,
      changes,
      description: AUDIT_ACTIONS.Roles.UPDATE.description,
      author: currentUsername,
      version: role.version,
    }, manager);

    return await userRoleRepo.findOne({ where: { id: role.id }, relations: ["userRolePermissions"] }) as UserRole;
  });
};

