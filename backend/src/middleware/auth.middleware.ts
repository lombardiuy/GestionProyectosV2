import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Tipado local para compatibilidad con requirePermission
interface UserRequest extends Request {
  user?: {
    id: number;
    username: string;
    userRole?: {
      name: string;
      userRolePermissions: {permission: string }[];
    };
  };
}

export function authMiddleware(req: UserRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Falta token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Falta token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
  

    // 🔹 Asignamos el objeto user esperado por requirePermission
    req.user = {
      id: decoded.id,
      username: decoded.username,
      userRole: decoded.userRole // viene tal cual del JWT
        ? {
            name: decoded.userRole.name,
            userRolePermissions: decoded.userRole.userRolePermissions || []
          }
        : undefined
    };

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
}
