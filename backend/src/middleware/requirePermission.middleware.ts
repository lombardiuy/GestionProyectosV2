import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// Carga los permisos desde el JSON en la raíz del proyecto
const permissionsPath = path.resolve(__dirname, '../../../modules.json');
const permissionsData = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));


interface PermissionEntry {
  permissions: { code: string; description: string }[];
}

// Aplana los permisos en una lista simple: USERS_CREATE, USERS_VIEW, etc.
const validPermissions = (permissionsData as PermissionEntry[]).flatMap(
  (m) => m.permissions.map((p) => p.code)
);

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

export function requirePermissionMiddleware(requiredPermission: string) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user; // ✅ ya tipado correctamente


    if (!user?.userRole?.userRolePermissions) {
      return res.status(403).json({ message: 'Acceso denegado: usuario sin permisos.' });
    }

    const userPermissions = user.userRole.userRolePermissions.map((p) => p.permission);

    // Si el permiso solicitado no existe en el JSON → error de configuración
    if (!validPermissions.includes(requiredPermission)) {
      return res.status(400).json({ message: `Permiso desconocido: ${requiredPermission}` });
    }

    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ message: 'No tienes permiso para esta acción.' });
    }

    next();
  };
}
