import * as factoryService from '../services/factory.service';
import { Request, Response } from 'express';


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
 * GET /factories/
 */
export const getAllFactories = async (req: Request, res: Response) => {
  try {
    const users = await factoryService.getAllFactories();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};




/**
 * GET factories/select/:id
 */
export const selectFactoryById = async (req: Request, res: Response) => {
 
  const factoryId = Number(req.params.id);
  if (isNaN(factoryId)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const factory = await factoryService.selectFactoryById(factoryId);
    if (!factory) return res.status(404).json({ error: 'Fábrica no encontrada' });
    res.json(factory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * POST /factory/create
 * req.body validado por CreateFactoryDto -> { name, location, owner, contact }
 */
export const createFactory = async (req: UserRequest, res: Response) => {

  try {
    const dto = req.body as {
      name: string;
      location: string;
      owner: string;
      contact: string;
    };


if (!req.user) throw new Error("Usuario no autenticado");


    const factory = await factoryService.createFactory(dto, req.user.username);
    res.json({ message: 'Fábrica creada', factory });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /factory/route/create
 * req.body validado por CreateFactoryDto -> { name, location, owner, contact }
 */
export const createFactoryRoute = async (req: UserRequest, res: Response) => {

  try {
    const dto = req.body as {
      name: string;
      description: string;
      factory:number
     
    };


if (!req.user) throw new Error("Usuario no autenticado");


    const factoryRoute = await factoryService.createFactoryRoute(dto, req.user.username);
    res.json({ message: 'Ruta creada', factoryRoute });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * POST /factory/suspension
 * req.body validado por SuspendFactoryRouteDto -> { id }
 */
export const suspensionFactory = async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Faltan datos' });
    if (!req.user) throw new Error("Usuario no autenticado");
    const user = await factoryService.suspensionFactory(Number(id), req.user.username);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * POST /factory/route/suspension
 * req.body validado por SuspendFactoryRouteDto -> { id }
 */
export const suspensionFactoryRoute = async (req: UserRequest, res: Response) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Faltan datos' });
    if (!req.user) throw new Error("Usuario no autenticado");
    const user = await factoryService.suspensionFactoryRoute(Number(id), req.user.username);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};