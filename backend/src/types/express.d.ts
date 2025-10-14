import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        userRole?: {
          name: string;
          userRolePermissions: {
         
            permission: string;
          }[];
        };
      };
    }
  }
}

export {};
