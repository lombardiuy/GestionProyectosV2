import * as userService from '../services/user.service';
import { Request, Response } from 'express';


// 🔹 Tipado local para Request que incluye user
interface UserRequest extends Request {
  user?: {
    id: number;
    username: string;
    userRole?: {
      name: string;
      userRolePermissions: {  permission: string }[];
    };
  };
}

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
export const createUser = async (req: UserRequest, res: Response) => {

  console.log(req.body)


  try {
    const dto = req.body as {
      name: string;
      username: string;
      password: string;
      userRole: number;
      hasProfilePicture:boolean;
    };


if (!req.user) throw new Error("Usuario no autenticado");


    const user = await userService.createUser(dto, req.user.username);
    res.json({ message: 'Usuario creado', user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: UserRequest, res: Response) => {
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
    if (!req.user) throw new Error("Usuario no autenticado");
    const updatedUser = await userService.updateUser(userId, dto, req.user.username);

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
export const updateUserProfile = async (req: UserRequest, res: Response) => {
  try {
    const { userID, actualPassword, newPassword, hasProfilePicture } = req.body;

    if (!userID) return res.status(400).json({ error: 'Faltan datos obligatorios' });

    const payload: any = { id: Number(userID) };

    if (typeof hasProfilePicture !== 'undefined') payload.hasProfilePicture = Boolean(hasProfilePicture);
    if (typeof actualPassword !== 'undefined') payload.actualPassword = String(actualPassword);
    if (typeof newPassword !== 'undefined') payload.newPassword = String(newPassword);
    if (!req.user) throw new Error("Usuario no autenticado");
    const updated = await userService.updateUserProfile(payload, req.user.username);
    res.json({ message: 'Perfil actualizado correctamente', user: updated });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /user/roles/create
 * req.body validado por SaveUserRoleDto -> { id?, name, permissions }
 */
export const saveUserRole = async (req: UserRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Usuario no autenticado");

    const { id, name, permissions } = req.body as {
      id?: number;
      name: string;
      permissions: string[];
    };

    if (!id) {
      // Crear
      const role = await userService.createUserRole(
        { name, permissions },
        req.user.username
      );

      return res.json({ message: "Rol creado", role });
    }

    // Actualizar
    const role = await userService.updateUserRole(
      { id, name, permissions },
      req.user.username
    );

    return res.json({ message: "Rol actualizado", role });

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};


/**
 * POST /user/setUserPassword
 * req.body validado por SetUserPasswordDto -> { id, password }
 */
export const setUserPassword = async (req: UserRequest, res: Response) => {
  try {
    const { id, password } = req.body;
    if (!id || !password) return res.status(400).json({ error: 'Faltan datos' });

    const user = await userService.setUserPassword(Number(id), String(password),req.user?.username);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * POST /user/resetUserPassword
 * req.body validado por ResetUserPasswordDto -> { id }
 */
export const resetUserPassword = async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Faltan datos' });
    if (!req.user) throw new Error("Usuario no autenticado");
    const user = await userService.resetUserPassword(Number(id), req.user.username);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * POST /user/suspension
 * req.body validado por SuspendUserDto -> { id }
 */
export const suspensionUser = async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Faltan datos' });
    if (!req.user) throw new Error("Usuario no autenticado");
    const user = await userService.suspensionUser(Number(id), req.user.username);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
