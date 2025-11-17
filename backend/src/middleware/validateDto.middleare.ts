import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export const validateDto = <T extends object>(dto: ClassConstructor<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const transformed = plainToClass(dto, req.body);

    const errors = await validate(transformed, {
      whitelist: true,       // elimina lo que no está en el DTO
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors.map(e => Object.values(e.constraints || {})).flat();
      return res.status(400).json({
        error: 'Error de validación',
        messages,
      });
    }

    req.body = transformed;
    next();
  };
};
