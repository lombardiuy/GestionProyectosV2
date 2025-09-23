import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { UserRole } from '../entities/UserRole.entity';
import { User } from '../entities/User.entity';

const userRoleRepository = AppDataSource.getRepository(UserRole);

// Extendemos Request para agregar user
interface AuthenticatedRequest extends Request {
  user?: User;
}

export function checkPermission(module: string, action: 'create' | 'read' | 'update' | 'delete' | 'approve') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'No autorizado: requiere usuario' });
    }

    const userRole = await userRoleRepository.findOne({
      where: { id: user.userRole.id },
      relations: ['modulePermissions'],
    });

    console.log(userRole)

    if (!userRole) {
      return res.status(403).json({ error: 'No hay roles asignados' });
    }

    const permission = userRole.modulePermissions.find(p => p.module === module);

    if (!permission || !permission[action]) {
      return res.status(403).json({ error: 'Permiso denegado' });
    }

    next();
  };
}
