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
 * Alterna la suspensión de la ruta
 */
/**
 * Alterna la suspensión de una ruta de fábrica (activar/inactivar)
 * — Además registra auditoría de la ruta y, si corresponde, auditoría de la fábrica (versionado).
 */
export const suspensionFactoryRoute = async (
  id: number,
  currentUsername: string
): Promise<Partial<FactoryRoute>> => {

  return await AppDataSource.transaction(async (manager) => {
    const factoryRouteRepo = manager.getRepository(FactoryRoute);
    const factoryRepo = manager.getRepository(Factory);

    // 1) OBTENER LA RUTA (con su fábrica para posible auditoría)
    const factoryRoute = await factoryRouteRepo.findOne({
      where: { id },
      relations: ["factory"],
    });

    if (!factoryRoute) {
      throw new Error(
        "Ruta desconocida. Si el error persiste contacte al administrador."
      );
    }

    // 2) BEFORE (snapshot)
    const beforeRoute = { ...factoryRoute };

    // 3) AFTER (toggle active)
    const afterRoute = {
      ...factoryRoute,
      active: !factoryRoute.active,
    };

    // 4) Detectar cambios en la ruta
    const routeChanges = detectModuleChanges(beforeRoute, afterRoute, {
      ignore: ["createdAt", "updatedAt", "factory"],
      relations: [],
    });

    // Si no hay cambios en la ruta, devolver sin tocar nada
    if (Object.keys(routeChanges).length === 0) {
      const { factory, ...rest } = factoryRoute;
      return rest;
    }

    // 5) Guardar cambios en la ruta
    Object.assign(factoryRoute, afterRoute);
    const savedRoute = await factoryRouteRepo.save(factoryRoute);

    // 6) Auditoría de la ruta (usar el estado AFTER para decidir la acción)
    const routeAction = afterRoute.active
      ? "FACTORY_ROUTE_ACTIVATION"
      : "FACTORY_ROUTE_SUSPENSION";

    await registerInAuditTrail(
      {
        module: "Factories",
        entity: "FactoryRoute",
        entityId: savedRoute.id,
        action: routeAction,
        changes: routeChanges,
        description: afterRoute.active
          ? "Reactivación de ruta."
          : "Suspensión de ruta.",
        author: currentUsername,
        version: savedRoute.version,
      },
      manager
    );

    // 7) --- AUDITORÍA DE LA FÁBRICA POR CAMBIO EN RUTA ---
    // Obtener entidad fábrica actual (ya estaba en relations, pero mejor recargar para consistencia)
    const factoryEntity = await factoryRepo.findOne({
      where: { id: factoryRoute.factory?.id },
    });

    if (!factoryEntity) {
      // Si por alguna razón no existe la fábrica (improbable), devolvemos la ruta guardada.
      const { factory, ...rest } = savedRoute;
      return rest;
    }

    // snapshot BEFORE factory (usar copia previa a cambios)
    const beforeFactory = { ...factoryEntity };

    // Aplicar el cambio que consideremos (aquí lo típico: incrementar versión de la fábrica)
    factoryEntity.version = (factoryEntity.version ?? 0) + 1;

    // snapshot AFTER factory
    const afterFactory = { ...factoryEntity };

    // Detectar cambios en la fábrica (ignorar timestamps)
    const factoryChanges = detectModuleChanges(beforeFactory, afterFactory, {
      ignore: ["createdAt", "updatedAt"],
    });

    // Si hubo cambios en la fábrica, guardar y auditar
    if (Object.keys(factoryChanges).length > 0) {
      const savedFactory = await factoryRepo.save(factoryEntity);

      await registerInAuditTrail(
        {
          module: "Factories",
          entity: "Factory",
          entityId: savedFactory.id,
          action: "FACTORY_UPDATE",
          changes: factoryChanges,
          description: `${afterRoute.active ? "Reactivación" : "Suspensión"} de la ruta ${savedRoute.name}`,
          author: currentUsername,
          version: savedFactory.version,
        },
        manager
      );
    }

    // 8) Devolver la ruta guardada (sin relations para consistencia)
    const { factory, ...rest } = savedRoute;
    return rest;
  });
};


/**
 * Alterna la suspensión de la fabrica
 */
export const suspensionFactory = async (
  id: number,
  currentUsername: string
): Promise<Partial<Factory>> => {

  return await AppDataSource.transaction(async (manager) => {
    const factoryRepo = manager.getRepository(Factory);
    const routeRepo = manager.getRepository(FactoryRoute);

    const factory = await factoryRepo.findOne({
      where: { id },
      relations: ["routes"],
    });

    if (!factory) {
      throw new Error("Fábrica desconocida. Si el error persiste contacte al administrador.");
    }

    // BEFORE
    const beforeFactory = { ...factory };

    // AFTER
    const afterFactory = { ...factory };
    afterFactory.active = !factory.active;

    // Detectar cambios
    const factoryChanges = detectModuleChanges(beforeFactory, afterFactory, {
      ignore: ["createdAt", "updatedAt", "routes"],
      relations: [],
    });

    // No hubo cambios → no auditar
    if (Object.keys(factoryChanges).length === 0) {
      return factory;
    }

    // Guardar estado de fábrica
    Object.assign(factory, afterFactory);
    const savedFactory = await factoryRepo.save(factory);

    // ***********************************************
    //  🔥 SUSPENSIÓN / ACTIVACIÓN DE TODAS LAS RUTAS
    // ***********************************************
    const newRouteState = afterFactory.active; // true = activar, false = suspender

    for (const route of factory.routes) {
      if (route.active === newRouteState) continue;

      const beforeRoute = { ...route };
      const afterRoute = { ...route, active: newRouteState };

      const routeChanges = detectModuleChanges(beforeRoute, afterRoute, {
        ignore: ["createdAt", "updatedAt", "factory"],
        relations: [],
      });

      // Guardar
      Object.assign(route, afterRoute);
      const savedRoute = await routeRepo.save(route);

      // Auditoría de la ruta
      await registerInAuditTrail(
        {
          module: "Factories",
          entity: "FactoryRoute",
          entityId: savedRoute.id,
          action: newRouteState
            ? "ROUTE_ACTIVATION_BY_FACTORY"
            : "ROUTE_SUSPENSION_BY_FACTORY",
          changes: routeChanges,
          description: newRouteState
            ? "Reactivación de ruta debido a reactivación de fábrica."
            : "Suspensión de ruta debido a suspensión de fábrica.",
          author: currentUsername,
          version: savedRoute.version,
        },
        manager
      );
    }

    // ***********************************************
    //  🔥 Auditoría de la fábrica
    // ***********************************************
    await registerInAuditTrail(
      {
        module: "Factories",
        entity: "Factory",
        entityId: savedFactory.id,
        action: afterFactory.active
          ? "FACTORY_ACTIVATION"
          : "FACTORY_SUSPENSION",
        changes: factoryChanges,
        description: afterFactory.active
          ? "Reactivación de fábrica."
          : "Suspensión de fábrica.",
        author: currentUsername,
        version: savedFactory.version,
      },
      manager
    );

    return savedFactory;
  });
};




