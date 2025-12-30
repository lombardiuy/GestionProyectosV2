// src/services/factories/factories.service.ts
import { AppDataSource } from '../../data-source';
import 'dotenv/config';
import { registerInAuditTrail, detectModuleChanges } from '../auditTrail.service';
import { createEmptyDir } from '../file.service';

import { Factory } from '../../entities/factories/factory.entity';
import { FactoryRoute } from '../../entities/factories/factory-route.entity';
import { Area } from '../../entities/areas/area.entity';
import { Equipment } from '../../entities/equipments/equipment.entity';

const factoryRepository = AppDataSource.getRepository(Factory);

const areaRepository = AppDataSource.getRepository(Area);
const equipmentRepository = AppDataSource.getRepository(Equipment);

// ------------------------
//  FABRICAS
// ------------------------

export const getAllFactories = async (): Promise<Partial<Factory>[]> => {
  try {
    const factories = await factoryRepository.find();
    return factories;
  } catch (error) {
    console.error(error);
    throw new Error('No se pudieron obtener las fábricas');
  }
};

export const selectFactoryById = async (factoryId: number): Promise<any | null> => {
  const factory = await factoryRepository.findOne({
    where: { id: factoryId },
    relations: ['routes'],
    select: ['id', 'name', 'location', 'contact', 'active', 'version']
  });

  if (!factory) return null;
  if (!factory.routes?.length) return factory;

  // Obtener áreas asociadas a las rutas
  const routeIds = factory.routes.map(r => r.id);
  const areas = await areaRepository
    .createQueryBuilder('area')
    .leftJoinAndSelect('area.areaClass', 'areaClass')
    .leftJoinAndSelect('area.routes', 'routes')
    .where('routes.id IN (:...routeIds)', { routeIds })
    .select([
      'area.id',
      'area.name',
      'area.code',
      'areaClass.id',
      'areaClass.name',
      'routes.id',
      'routes.name'
    ])
    .getMany();

  if (!areas.length) return factory;

  const areaIds = areas.map(a => a.id);

  // Obtener equipos asociados a las áreas
  const equipments = await equipmentRepository
    .createQueryBuilder('equipment')
    .leftJoin('equipment.areas', 'area')
    .leftJoinAndSelect('equipment.equipmentClass', 'equipmentClass')
    .where('area.id IN (:...areaIds)', { areaIds })
    .select([
      'equipment.id',
      'equipment.name',
      'equipment.hasPicture',
      'equipmentClass.id',
      'area.id'
    ])
    .getMany();

  // Agrupar equipos por área
  const equipmentByArea = new Map<number, any[]>();
  for (const eq of equipments) {
    for (const area of eq.areas ?? []) {
      if (!equipmentByArea.has(area.id)) equipmentByArea.set(area.id, []);
      equipmentByArea.get(area.id)!.push({
        id: eq.id,
        name: eq.name,
        hasPicture: eq.hasPicture,
        equipmentClass: eq.equipmentClass ? { id: eq.equipmentClass.id } : null
      });
    }
  }

  // Insertar equipos en cada área
  for (const area of areas) {
    (area as any).equipments = equipmentByArea.get(area.id) ?? [];
  }

  // Insertar áreas en cada ruta
  for (const route of factory.routes) {
    (route as any).areas = areas.filter(a => a.routes.some(r => r.id === route.id));
  }

  return factory;
};

export const selectFactoryByName = async (factoryName: string): Promise<any | null> => {
  const name = factoryName.trim();
  if (!name) return null;

  const factory = await factoryRepository.findOne({
    where: { name },
    relations: ['routes'],
    select: ['id', 'name', 'location', 'contact', 'active', 'hasProfilePicture', 'version']
  });

  if (!factory) return null;
  if (!factory.routes?.length) return factory;

  const routeIds = factory.routes.map(r => r.id);

  const areas = await areaRepository
    .createQueryBuilder('area')
    .leftJoinAndSelect('area.areaClass', 'areaClass')
    .leftJoinAndSelect('area.routes', 'routes')
    .where('routes.id IN (:...routeIds)', { routeIds })
    .select([
      'area.id',
      'area.name',
      'area.code',
      'areaClass.id',
      'areaClass.name',
      'routes.id',
      'routes.name'
    ])
    .getMany();

  if (!areas.length) return factory;

  const areaIds = areas.map(a => a.id);

  const equipments = await equipmentRepository
    .createQueryBuilder('equipment')
    .leftJoin('equipment.areas', 'area')
    .leftJoinAndSelect('equipment.equipmentClass', 'equipmentClass')
    .where('area.id IN (:...areaIds)', { areaIds })
    .select([
      'equipment.id',
      'equipment.name',
      'equipment.hasPicture',
      'equipmentClass.id',
      'area.id'
    ])
    .getMany();

  const equipmentByArea = new Map<number, any[]>();
  for (const eq of equipments) {
    for (const area of eq.areas ?? []) {
      if (!equipmentByArea.has(area.id)) equipmentByArea.set(area.id, []);
      equipmentByArea.get(area.id)!.push({
        id: eq.id,
        name: eq.name,
        hasPicture: eq.hasPicture,
        equipmentClass: eq.equipmentClass ? { id: eq.equipmentClass.id } : null
      });
    }
  }

  for (const area of areas) {
    (area as any).equipments = equipmentByArea.get(area.id) ?? [];
  }

  for (const route of factory.routes) {
    (route as any).areas = areas.filter(a => a.routes.some(r => r.id === route.id));
  }

  return factory;
};

export const createFactory = async (
  payload: { name: string; location: string; contact: string; hasProfilePicture: boolean },
  currentUsername: string
): Promise<Partial<Factory>> => {
  const { name, location, contact, hasProfilePicture } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const factoryRepo = manager.getRepository(Factory);

    const exists = await factoryRepo.findOneBy({ name });
    if (exists) throw new Error('La fábrica ya existe');

    const newFactory = factoryRepo.create({
      name,
      location,
      contact,
      active: true,
      hasProfilePicture,
      routes: []
    });

    const saved = await factoryRepo.save(newFactory);
    await createFactoryDirectories(saved.id);

    await registerInAuditTrail({
      module: 'Factories',
      entity: 'Factory',
      entityId: saved.id,
      action: 'FACTORY_CREATE',
      changes: { name: { oldValue: null, newValue: saved.name } },
      description: 'Versión original.',
      author: currentUsername,
      version: saved.version
    }, manager);

    return saved;
  });
};

export const updateFactory = async (
  id: number,
  payload: { name?: string; location?: string; contact?: string; hasProfilePicture?: boolean },
  currentUsername: string
): Promise<Partial<Factory>> => {
  return await AppDataSource.transaction(async (manager) => {
    const factoryRepo = manager.getRepository(Factory);
    const factory = await factoryRepo.findOne({ where: { id } });
    if (!factory) throw new Error('Fábrica inexistente.');

    const before = { ...factory };

    if (payload.name !== undefined) factory.name = payload.name;
    if (payload.location !== undefined) factory.location = payload.location;
    if (payload.contact !== undefined) factory.contact = payload.contact;
    if (payload.hasProfilePicture !== undefined) factory.hasProfilePicture = payload.hasProfilePicture;

    const after = { ...factory };
    const changes = detectModuleChanges(before, after, { ignore: ['createdAt', 'updatedAt', 'routes'] });
    if (!Object.keys(changes).length) return factory;

    factory.version = (factory.version ?? 0) + 1;
    const saved = await factoryRepo.save(factory);

    await registerInAuditTrail({
      module: 'Factories',
      entity: 'Factory',
      entityId: saved.id,
      action: 'FACTORY_UPDATE',
      changes,
      description: 'Actualización de datos de fábrica.',
      author: currentUsername,
      version: saved.version
    }, manager);

    return saved;
  });
};

export const suspensionFactory = async (id: number, currentUsername: string): Promise<Partial<Factory>> => {
  return await AppDataSource.transaction(async (manager) => {
    const factoryRepo = manager.getRepository(Factory);
    const routeRepo = manager.getRepository(FactoryRoute);

    const factory = await factoryRepo.findOne({ where: { id }, relations: ['routes'] });
    if (!factory) throw new Error('Fábrica desconocida. Si el error persiste contacte al administrador.');

    const beforeFactory = { ...factory };
    const afterFactory = { ...factory, active: !factory.active };
    const factoryChanges = detectModuleChanges(beforeFactory, afterFactory, { ignore: ['createdAt', 'updatedAt', 'routes'] });
    if (!Object.keys(factoryChanges).length) return factory;

    Object.assign(factory, afterFactory);
    const savedFactory = await factoryRepo.save(factory);

    // Activar/Inactivar todas las rutas
    const newRouteState = afterFactory.active;
    for (const route of factory.routes) {
      if (route.active === newRouteState) continue;

      const beforeRoute = { ...route };
      const afterRoute = { ...route, active: newRouteState };
      const routeChanges = detectModuleChanges(beforeRoute, afterRoute, { ignore: ['createdAt', 'updatedAt', 'factory'] });

      Object.assign(route, afterRoute);
      const savedRoute = await routeRepo.save(route);

      await registerInAuditTrail({
        module: 'Factories',
        entity: 'FactoryRoute',
        entityId: savedRoute.id,
        action: newRouteState ? 'FACTORY_ROUTE_ACTIVATION' : 'FACTORY_ROUTE_SUSPENSION',
        changes: routeChanges,
        description: newRouteState
          ? 'Reactivación de ruta debido a reactivación de fábrica.'
          : 'Suspensión de ruta debido a suspensión de fábrica.',
        author: currentUsername,
        version: savedRoute.version
      }, manager);
    }

    await registerInAuditTrail({
      module: 'Factories',
      entity: 'Factory',
      entityId: savedFactory.id,
      action: afterFactory.active ? 'FACTORY_ACTIVATION' : 'FACTORY_SUSPENSION',
      changes: factoryChanges,
      description: afterFactory.active ? 'Reactivación de fábrica.' : 'Suspensión de fábrica.',
      author: currentUsername,
      version: savedFactory.version
    }, manager);

    return savedFactory;
  });
};

export const createFactoryDirectories = async (factoryID: number) => {
  await createEmptyDir('factories/factory_' + factoryID);
};


