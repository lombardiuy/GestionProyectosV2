import { AppDataSource } from '../data-source';
import { AuditTrail } from '../entities/auditTrail/auditTrail.entity';


interface AuditParams {
  entity: string;          // nombre de la entidad modificada
  entityId: number;        // id del registro modificado
  action: string;          // CREATE | UPDATE | DELETE
  changes:any;          // Lista de cambios
  description?: string;    //Mensaje descripcion del cambio
  author: string;          // nombre o username del autor
  version:number;
}

export const registerInAuditTrail = async (params: AuditParams, manager?: any): Promise<AuditTrail> => {
  try {
    const repo = manager 
      ? manager.getRepository(AuditTrail) 
      : AppDataSource.getRepository(AuditTrail);

    const trail = repo.create({
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





