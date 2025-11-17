import * as userService from '../services/user.service';
import { Request, Response } from 'express';

/**
 * GET /user/list
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /user/roles
 */
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const roles = await userService.getUserRoles();
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /user/select/:id
 */
export const selectUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const user = await userService.selectUserById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /user/create
 * req.body validado por CreateUserDto -> { name, username, password, userRoleId }
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const dto = req.body as {
      name: string;
      username: string;
      password: string;
      userRoleId: number;
    };

    const user = await userService.create(dto);
    res.json({ message: 'Usuario creado', user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    const dto = req.body as {
      name?: string;
      username?: string;
      password?: string;
      userRoleId?: number;
      active?: boolean;
      suspended?: boolean;
      hasProfilePicture?: boolean;
    };

    const updatedUser = await userService.update(userId, dto);

    res.json({
      message: "Usuario actualizado",
      user: updatedUser
    });

  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/**
 * POST /user/updateUserProfile
 * req.body validado por UpdateUserProfileDto -> { userID, actualPassword?, newPassword?, hasProfilePicture? }
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userID, actualPassword, newPassword, hasProfilePicture } = req.body;

    if (!userID) return res.status(400).json({ error: 'Faltan datos obligatorios' });

    const payload: any = { id: Number(userID) };

    if (typeof hasProfilePicture !== 'undefined') payload.hasProfilePicture = Boolean(hasProfilePicture);
    if (typeof actualPassword !== 'undefined') payload.actualPassword = String(actualPassword);
    if (typeof newPassword !== 'undefined') payload.newPassword = String(newPassword);

    const updated = await userService.updateUserProfile(payload);
    res.json({ message: 'Perfil actualizado correctamente', user: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /user/roles/create
 * req.body validado por SaveUserRoleDto -> { id?, name, permissions }
 */
export const saveUserRole = async (req: Request, res: Response) => {
  try {
    const { userRole, permissions, id, name } = req.body;

    // soporta dos formatos: { userRole: { id?, name }, permissions: [...] } o { id?, name, permissions }
    let payload: { id?: number; name?: string; permissions?: string[] } = {};

    if (userRole) {
      payload.id = userRole.id;
      payload.name = userRole.name;
      payload.permissions = permissions;
    } else {
      payload.id = id;
      payload.name = name;
      payload.permissions = permissions;
    }

    if (!payload.id) {
      // crear
      const role = await userService.createUserRole({ name: payload.name!, permissions: payload.permissions || [] });
      res.json({ message: 'Rol creado', role });
    } else {
      // actualizar
      const role = await userService.updateUserRole({
        id: payload.id,
        name: payload.name,
        permissions: payload.permissions || [],
      });
      res.json({ message: 'Rol actualizado', role });
    }
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /user/setUserPassword
 * req.body validado por SetUserPasswordDto -> { id, password }
 */
export const setUserPassword = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) return res.status(400).json({ error: 'Faltan datos' });

    const user = await userService.setUserPassword(Number(id), String(password));
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * POST /user/resetUserPassword
 * req.body validado por ResetUserPasswordDto -> { id }
 */
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Faltan datos' });

    const user = await userService.resetUserPassword(Number(id));
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * POST /user/suspension
 * req.body validado por SuspendUserDto -> { id }
 */
export const suspensionUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Faltan datos' });

    const user = await userService.suspensionUser(Number(id));
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
