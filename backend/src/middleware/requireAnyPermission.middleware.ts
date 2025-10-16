import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

// Carga los permisos desde el JSON en la raíz del proyecto
const permissionsPath = path.resolve(__dirname, '../../../modulePermissions.json');
const permissionsData = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));

interface PermissionEntry {
  permissions: { code: string; description: string }[];
}

// Aplana todos los permisos válidos
const validPermissions = (permissionsData as PermissionEntry[]).flatMap(
  (m) => m.permissions.map((p) => p.code)
);

// 🔹 Tipado local igual al usado en requirePermission
interface UserRequest extends Request {
  user?: {
    id: number;
    username: string;
    userRole?: {
      name: string;
      userRolePermissions: { permission: string }[];
    };
  };
}

/**
 * Middleware que permite el acceso si el usuario tiene **al menos uno** de los permisos requeridos.
 * @example
 * router.post('/suspension', authMiddleware, requireAnyPermission('USERS_SUSPENSION', 'USERS_SUSPENSION'), suspensionUser);
 */
export function requireAnyPermissionMiddleware(...requiredPermissions: string[]) {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user?.userRole?.userRolePermissions) {
      return res.status(403).json({ message: 'Acceso denegado: usuario sin permisos.' });
    }

    const userPermissions = user.userRole.userRolePermissions.map(p => p.permission);

    // Verificar que todos los permisos requeridos existan en el JSON (configuración válida)
    const invalid = requiredPermissions.filter(p => !validPermissions.includes(p));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Permisos desconocidos: ${invalid.join(', ')}` });
    }

    // ✅ Si el usuario tiene alguno de los permisos requeridos, permitir acceso
    const hasAny = requiredPermissions.some(p => userPermissions.includes(p));
    if (!hasAny) {
      return res.status(403).json({ message: 'No tienes permiso para esta acción.' });
    }

    next();
  };
}
