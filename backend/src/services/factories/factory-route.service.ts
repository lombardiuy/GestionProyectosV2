// src/services/factories/factories.service.ts
import { AppDataSource } from '../../data-source';
import 'dotenv/config';
import { registerInAuditTrail, detectModuleChanges } from '../auditTrail.service';
import { Factory } from '../../entities/factories/factory.entity';
import { FactoryRoute } from '../../entities/factories/factory-route.entity';




// ------------------------
//  RUTAS
// ------------------------

export const createFactoryRoute = async (
  payload: { name: string; description: string; factory: number },
  currentUsername: string
): Promise<Partial<FactoryRoute>> => {
  const { name, description, factory } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const factoryRepo = manager.getRepository(Factory);
    const factoryRouteRepo = manager.getRepository(FactoryRoute);

    const exists = await factoryRouteRepo.findOne({ where: { name, factory: { id: factory } } });
    if (exists) throw new Error('Ya existe una ruta con ese nombre en esta fábrica.');

    const newRoute = factoryRouteRepo.create({ name, description, factory: { id: factory }, active: true, areas: [] });
    const savedRoute = await factoryRouteRepo.save(newRoute);

    await registerInAuditTrail({
      module: 'Factories',
      entity: 'FactoryRoute',
      entityId: savedRoute.id,
      action: 'FACTORY_ROUTE_CREATE',
      changes: { name: { oldValue: null, newValue: savedRoute.name } },
      description: 'Versión original.',
      author: currentUsername,
      version: savedRoute.version
    }, manager);

    // Actualizar versión de fábrica
    const factoryEntity = await factoryRepo.findOne({ where: { id: factory } });
    if (!factoryEntity) throw new Error('La fábrica no existe.');

    const before = { ...factoryEntity };
    factoryEntity.version = (factoryEntity.version ?? 0) + 1;
    const after = { ...factoryEntity };
    const factoryChanges = detectModuleChanges(before, after, { ignore: ['createdAt', 'updatedAt'] });

    if (Object.keys(factoryChanges).length > 0) {
      const savedFactory = await factoryRepo.save(factoryEntity);
      await registerInAuditTrail({
        module: 'Factories',
        entity: 'Factory',
        entityId: savedFactory.id,
        action: 'FACTORY_UPDATE',
        changes: factoryChanges,
        description: 'Se agrega la ruta ' + savedRoute.name,
        author: currentUsername,
        version: savedFactory.version
      }, manager);
    }

    return savedRoute;
  });
};

export const updateFactoryRoute = async (
  id: number,
  payload: { name?: string; description?: string },
  currentUsername: string
): Promise<Partial<FactoryRoute>> => {
  return await AppDataSource.transaction(async (manager) => {
    const factoryRouteRepo = manager.getRepository(FactoryRoute);
    const route = await factoryRouteRepo.findOne({ where: { id } });
    if (!route) throw new Error('Ruta inexistente.');

    const before = { ...route };
    if (payload.name !== undefined) route.name = payload.name;
    if (payload.description !== undefined) route.description = payload.description;

    const after = { ...route };
    const changes = detectModuleChanges(before, after, { ignore: ['createdAt', 'updatedAt', 'factory'] });
    if (!Object.keys(changes).length) return route;

    route.version = (route.version ?? 0) + 1;
    const saved = await factoryRouteRepo.save(route);

    await registerInAuditTrail({
      module: 'Factories',
      entity: 'FactoryRoute',
      entityId: saved.id,
      action: 'FACTORY_ROUTE_UPDATE',
      changes,
      description: 'Actualización de datos de ruta.',
      author: currentUsername,
      version: saved.version
    }, manager);

    return saved;
  });
};

export const suspensionFactoryRoute = async (
  id: number,
  currentUsername: string
): Promise<Partial<FactoryRoute>> => {
  return await AppDataSource.transaction(async (manager) => {
    const factoryRouteRepo = manager.getRepository(FactoryRoute);
    const factoryRepo = manager.getRepository(Factory);

    const route = await factoryRouteRepo.findOne({ where: { id }, relations: ['factory'] });
    if (!route) throw new Error('Ruta desconocida. Si el error persiste contacte al administrador.');

    const beforeRoute = { ...route };
    const afterRoute = { ...route, active: !route.active };
    const changes = detectModuleChanges(beforeRoute, afterRoute, { ignore: ['createdAt', 'updatedAt', 'factory'] });
    if (!Object.keys(changes).length) return route;

    Object.assign(route, afterRoute);
    const savedRoute = await factoryRouteRepo.save(route);

    const action = afterRoute.active ? 'FACTORY_ROUTE_ACTIVATION' : 'FACTORY_ROUTE_SUSPENSION';
    await registerInAuditTrail({
      module: 'Factories',
      entity: 'FactoryRoute',
      entityId: savedRoute.id,
      action,
      changes,
      description: afterRoute.active ? 'Reactivación de ruta.' : 'Suspensión de ruta.',
      author: currentUsername,
      version: savedRoute.version
    }, manager);

    // Actualizar versión de la fábrica
    const factory = await factoryRepo.findOne({ where: { id: route.factory?.id } });
    if (factory) {
      const beforeFactory = { ...factory };
      factory.version = (factory.version ?? 0) + 1;
      const afterFactory = { ...factory };
      const factoryChanges = detectModuleChanges(beforeFactory, afterFactory, { ignore: ['createdAt', 'updatedAt'] });

      if (Object.keys(factoryChanges).length > 0) {
        const savedFactory = await factoryRepo.save(factory);
        await registerInAuditTrail({
          module: 'Factories',
          entity: 'Factory',
          entityId: savedFactory.id,
          action: 'FACTORY_UPDATE',
          changes: factoryChanges,
          description: `${afterRoute.active ? 'Reactivación' : 'Suspensión'} de la ruta ${savedRoute.name}`,
          author: currentUsername,
          version: savedFactory.version
        }, manager);
      }
    }

    return savedRoute;
  });
};
