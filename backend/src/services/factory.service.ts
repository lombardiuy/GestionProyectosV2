import { AppDataSource } from '../data-source';

import 'dotenv/config';
import { UserRolePermission } from '../entities/users/UserRolePermission.entity';
import { registerInAuditTrail, detectModuleChanges } from './auditTrail.service';
import { In, Not } from "typeorm";
import { Factory } from '../entities/factories/factory.entity';

import { Area } from '../entities/areas/area.entity';
import { Equipment } from '../entities/equipments/equipment.entity';
import { FactoryRoute } from '../entities/factories/factory-route.entity';

const factoryRepository = AppDataSource.getRepository(Factory);
const areaRepository = AppDataSource.getRepository(Area);
const equipmentRepository = AppDataSource.getRepository(Equipment);

/**
 * Obtiene todas las fabricas sin detalles
 */
export const getAllFactories = async (): Promise<Partial<Factory>[]> => {
  try {
    
    const factories = await factoryRepository.find();
    
    return factories
  } catch (error) {
    console.error(error);
    throw new Error('No se pudieron obtener las áreas');
  }
};

export const selectFactoryById = async (factoryId: number): Promise<any | null> => {
  // 1) Obtener fábrica con datos básicos + rutas
  const factory = await factoryRepository.findOne({
    where: { id: factoryId },
    relations: ["routes"],
    select: ["id", "name", "location", "owner", "contact"]
  });

  if (!factory) return null;

  // Si no tiene rutas, ya no hay áreas asociadas
  if (!factory.routes || factory.routes.length === 0) {
    return factory;
  }

  // 2) Obtener todas las áreas relacionadas a esas rutas
  const routeIds = factory.routes.map(r => r.id);

  const areas = await areaRepository
    .createQueryBuilder("area")
    .leftJoinAndSelect("area.areaClass", "areaClass")
    .leftJoinAndSelect("area.routes", "routes")
    .where("routes.id IN (:...routeIds)", { routeIds })
    .select(["area.id", "area.name", "area.code"])
    .addSelect(["areaClass.id", "areaClass.name"])
    .addSelect(["routes.id", "routes.name"])
    .getMany();

  const areaIds = areas.map(a => a.id);

  // 3) Obtener equipos por área
  const equipments = await equipmentRepository.find({
    where: { area: In(areaIds) },
    relations: ["equipmentClass", "area"],
    select: ["id", "name", "hasPicture"]
  });

  // 4) Agrupar equipos por areaId
  const equipmentByArea = new Map<number, any[]>();

  for (const eq of equipments) {
    const areaId = eq.area?.id;
    if (!areaId) continue;

    if (!equipmentByArea.has(areaId)) {
      equipmentByArea.set(areaId, []);
    }

    equipmentByArea.get(areaId)!.push({
      id: eq.id,
      name: eq.name,
      hasPicture: eq.hasPicture,
      equipmentClass: eq.equipmentClass
        ? { id: eq.equipmentClass.id }
        : null
    });
  }

  // 5) Insertar equipos dentro de cada área
  for (const area of areas) {
    area.equipments = equipmentByArea.get(area.id) ?? [];
  }

  // 6) Insertar áreas dentro de cada ruta
  for (const route of factory.routes) {
    route.areas = areas.filter(a => a.routes.some(r => r.id === route.id));
  }

  return factory;
};

/**
 * Crea una fábrica nueva
 * Recibe un objeto con shape validado por DTO: { name, location, owner, contact}
 */
export const createFactory = async (payload: {
  name: string;
  location: string;
  owner: string;
  contact: string;
},  currentUsername: string // <-- el usuario logueado 
): Promise<Partial<Factory>> => {
  const { name, location, owner, contact } = payload;

 

  return await AppDataSource.transaction(async (manager) => {
    const factoryRepo = manager.getRepository(Factory);

    // Validaciones
    const exists = await factoryRepo.findOneBy({ name });
    if (exists) {
      throw new Error('La fábrica ya existe');
    }


 
    const newFactory = factoryRepo.create({
      name,
      location,
      owner, 
      contact,
      active:true,
      routes:[]

    });

    const saved = await factoryRepo.save(newFactory);

    // ✅ CORRECCIÓN: Normalizar "changes" para crear usuario (usar key 'username' en lugar de 'user')
    await registerInAuditTrail(
      {
        module:"Factories",
        entity: 'Factory',
        entityId: saved.id,
        action: 'FACTORY_CREATE',
        changes: { name: { oldValue: null, newValue: saved.name } }, 
        description: 'Versión original.',
        author: currentUsername,
        version: saved.version
      },
      manager // pasamos el manager para que sea parte de la misma transacción
    );

    return saved;
  });
};


/**
 * Crea una ruta nueva
 * Recibe un objeto con shape validado por DTO: { name, descripion, factory}
 */
export const createFactoryRoute = async (
  payload: {
    name: string;
    description: string;
    factory: number;
  },
  currentUsername: string
): Promise<Partial<Factory>> => {

  const { name, description, factory } = payload;

  return await AppDataSource.transaction(async (manager) => {
    const factoryRouteRepo = manager.getRepository(FactoryRoute);
    const factoryRepo = manager.getRepository(Factory);

    // 1) VALIDACIÓN RUTA DUPLICADA ───────────────────────────────────
    const exists = await factoryRouteRepo.findOne({
      where: { name, factory: { id: factory } },
    });

    if (exists) {
      throw new Error("Ya existe una ruta con ese nombre en esta fábrica.");
    }

    // 2) CREAR LA NUEVA RUTA ─────────────────────────────────────────
    const newFactoryRoute = factoryRouteRepo.create({
      name,
      description,
      factory: { id: factory },
      active: true,
      areas: [],
    });

    const savedFactoryRoute = await factoryRouteRepo.save(newFactoryRoute);

    // 3) AUDITORÍA DE LA RUTA ─────────────────────────────────────────
    await registerInAuditTrail(
      {
        module: "Factories",
        entity: "FactoryRoute",
        entityId: savedFactoryRoute.id,
        action: "FACTORY_ROUTE_CREATE",
        changes: {
          name: { oldValue: null, newValue: savedFactoryRoute.name },
        },
        description: "Versión original.",
        author: currentUsername,
        version: savedFactoryRoute.version,
      },
      manager
    );

    // 4) OBTENER FÁBRICA PARA DETECTAR CAMBIOS ───────────────────────
    const factoryEntity = await factoryRepo.findOne({
      where: { id: factory },
    });

    if (!factoryEntity) throw new Error("La fábrica no existe.");

    const before = { ...factoryEntity };

    // 5) ACTUALIZAR VERSION ──────────────────────────────────────────
    factoryEntity.version = factoryEntity.version + 1;

    const after = { ...factoryEntity };

    // 6) DETECTAR CAMBIOS EN FÁBRICA CON detectModuleChanges ─────────
    const factoryChanges = detectModuleChanges(before, after, {
      ignore: ["createdAt", "updatedAt"],
    });

    // 7) GUARDAR FÁBRICA SI REALMENTE CAMBIÓ ──────────────────────────
    let savedFactory = factoryEntity;

    if (Object.keys(factoryChanges).length > 0) {
      savedFactory = await factoryRepo.save(factoryEntity);

      // 8) AUDITORÍA DE LA FÁBRICA ───────────────────────────────────
      await registerInAuditTrail(
        {
          module: "Factories",
          entity: "Factory",
          entityId: savedFactory.id,
          action: "FACTORY_UPDATE",
          changes: factoryChanges,
          description: "Se agrega la ruta " + savedFactoryRoute.name,
          author: currentUsername,
          version: savedFactory.version,
        },
        manager
      );
    }

    // 9) RETORNAR RUTA CREADA ─────────────────────────────────────────
    return savedFactoryRoute;
  });
};



/**
 * Alterna la suspensión del usuario
 */
export const suspensionFactoryRoute = async (
  id: number,
  currentUsername: string
): Promise<Partial<FactoryRoute>> => {

  return await AppDataSource.transaction(async (manager) => {
    const factoryRouteRepo = manager.getRepository(FactoryRoute);

    // Buscar usuario
    const factoryRoute = await factoryRouteRepo.findOne({
      where: { id },
      relations: ["factory"], // consistencia con el módulo
    });

    if (!factoryRoute) {
      throw new Error('Ruta desconocida. Si el error persiste contacte al administrador.');
    }

    // BEFORE
    const before = { ...factoryRoute };

    // AFTER (invertir suspensión)
    const after: any = { ...factoryRoute };
    after.active = !factoryRoute.active;

    // Detectar cambios
    const changes = detectModuleChanges(before, after, {
      ignore: ["createdAt", "updatedAt", "factory"],
      relations: [],
    });

    // Si no hubo cambios, no guardar ni auditar
    if (Object.keys(changes).length === 0) {
      const { ...rest } = factoryRoute;
      return rest;
    }

    // Guardar cambios
    Object.assign(factoryRoute, after);
    const saved = await factoryRouteRepo.save(factoryRoute);

    // ✅ CORRECCIÓN: usar el estado AFTER para decidir la acción de auditoría (antes se usaba el estado ANTERIOR)
    await registerInAuditTrail(
      {
        module: "Factories",
        entity: "FactoryRoute",
        entityId: saved.id,
        action: after.active ? "FACTORY_ROUTE_ACTIVATION" : "FACTORY_ROUTE_SUSPENSION", // ✅ CORRECCIÓN
        changes: changes,
        description: after.active
          ? "Reactivación de ruta."
          : "Inactivación de ruta.",
        author: currentUsername,
        version: saved.version,
      },
      manager
    );

    return saved;
  });
};




