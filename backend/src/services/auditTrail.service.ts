import { AppDataSource } from '../data-source';
import { AuditTrail } from '../entities/auditTrail/auditTrail.entity';
import {
  FindOptionsWhere,
  ILike,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual
} from "typeorm";

interface AuditParams {
  module: string;          // nombre del modulo modificado
  entity: string;          // nombre de la entidad modificada
  entityId: number;        // id del registro modificado
  action: string;          // Resumen del cambio
  changes:any;             // Lista de cambios
  description?: string;    //Mensaje descripcion del cambio
  author: string;          // nombre o username del autor
  version:number;          //Version del registro 
}

  const auditRepo = AppDataSource.getRepository(AuditTrail);

export const getAuditTrail = async (options: {
    page: number;
    pageSize: number;
    search?: string;
    entity?: string;
    entityId?: number;
    author?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>{
    const {
      page,
      pageSize,
      search,
      entity,
      entityId,
      author,
      action,
      dateFrom,
      dateTo
    } = options;

    const where: FindOptionsWhere<AuditTrail>[] = [];
    const base: FindOptionsWhere<AuditTrail> = {};

    if (entity) base.entity = entity;
    if (entityId) base.entityId = entityId;
    if (author) base.author = ILike(`%${author}%`);
    if (action) base.action = action;

    // FILTRO FECHAS
  // FILTRO FECHAS (CORREGIDO)
if (dateFrom || dateTo) {

  let from: Date | undefined;
  let to: Date | undefined;

 if (dateFrom) {
  from = new Date(`${dateFrom}T00:00:00.000Z`);
}
if (dateTo) {
  to = new Date(`${dateTo}T23:59:59.999Z`);
}

  if (from && to) {
 
    base.created = Between(from, to);
  } else if (from) {
    base.created = MoreThanOrEqual(from);
  } else if (to) {
    base.created = LessThanOrEqual(to);
  }
}


    // SEARCH GLOBAL
  // SEARCH GLOBAL
if (search) {
  // Detectar si el search es del tipo "#X"
  const matchIdSearch = search.match(/^#(\d+)$/);

  if (matchIdSearch) {
    // Extraer el número
    const idNumber = Number(matchIdSearch[1]);

    // Buscar por ID exacto
    where.push({ ...base, id: idNumber });

  } else {
    // Búsqueda normal por texto
    where.push(
      { ...base, description: ILike(`%${search}%`) },
      { ...base, changes: ILike(`%${search}%`) }
    );
  }

} else {
  where.push(base);
}


    const [data, total] = await auditRepo.findAndCount({
      where,
      order: { created: "DESC" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

export const registerInAuditTrail = async (params: AuditParams, manager?: any): Promise<AuditTrail> => {
  try {
    const repo = manager 
      ? manager.getRepository(AuditTrail) 
      : AppDataSource.getRepository(AuditTrail);

    const trail = repo.create({
      module: params.module,
      entity: params.entity,
      entityId: params.entityId,
      action: params.action,
      changes: JSON.stringify(params.changes),
      description: params.description ?? null,
      author: params.author,
      version: params.version
    });

    return await repo.save(trail);

  } catch (error) {
    console.error(error);
    throw new Error('No se pudo registrar el auditTrail');
  }
};

export const getAuditTrailByEntity = async (entity: string, entityId: number) => {
  return await auditRepo.find({
    where: { entity, entityId },
    order: { version: "ASC" } 
  });
};


export const detectModuleChanges = (
  before: any,
  after: any,
  options?: {
    ignore?: string[];
    relations?: string[];
  }
): Record<string, any> => {

  const changes: any = {};

  const ignore = options?.ignore ?? [];
  const relations = options?.relations ?? [];

  for (const key of Object.keys(after)) {
    if (ignore.includes(key)) continue;

    const oldVal = before[key];
    const newVal = after[key];

    // 🔐 Manejo especial para password
    if (key === "password") {
      if (oldVal !== newVal) {
        changes[key] = {
          oldValue: "[PROTEGIDO]",
          newValue: "[ACTUALIZADO]"
        };
      }
      continue;
    }

    // Caso relaciones ManyToOne
    if (relations.includes(key)) {
      const oldId = oldVal?.id ?? null;
      const newId = newVal?.id ?? null;

      if (oldId !== newId) {
        changes[key] = {
          oldValue: oldVal?.name || oldId,
          newValue: newVal?.name || newId,
        };
      }

      continue;
    }

    // Caso campos primitivos
    if (oldVal !== newVal) {
      changes[key] = {
        oldValue: oldVal,
        newValue: newVal,
      };
    }
  }

  return changes;
}


export const getFilterOptions = async() => {
  const repo = AppDataSource.getRepository(AuditTrail);

  const entities = await repo.createQueryBuilder("a")
    .select("DISTINCT a.entity", "value")
    .orderBy("a.entity")
    .getRawMany();

  const actions = await repo.createQueryBuilder("a")
    .select("DISTINCT a.action", "value")
    .orderBy("a.action")
    .getRawMany();

  const authors = await repo.createQueryBuilder("a")
    .select("DISTINCT a.author", "value")
    .orderBy("a.author")
    .getRawMany();

  return {
    entities: entities.map(e => e.value),
    actions: actions.map(a => a.value),
    authors: authors.map(a => a.value)
  };
}



