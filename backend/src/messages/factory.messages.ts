export const FACTORY_ERRORS = {
  NOT_FOUND: 'Fábrica desconocida. Si el error persiste contacte al administrador.',
  ROUTE_NOT_FOUND: 'Ruta de fábrica desconocida. Si el error persiste contacte al administrador.',
  NAME_EXISTS: 'Ya existe una fábrica con ese nombre.',
  ROUTE_NAME_EXISTS: 'Ya existe una ruta con ese nombre en esta fábrica.',
};

export const AUDIT_ACTIONS = {
  Factories: {
    CREATE: { action: 'FACTORY_CREATE', description: 'Creación de fábrica.' },
    UPDATE: { action: 'FACTORY_UPDATE', description: 'Actualización de datos de fábrica.' },
    ACTIVATION: { action: 'FACTORY_ACTIVATION', description: 'Reactivación de fábrica.' },
    SUSPENSION: { action: 'FACTORY_SUSPENSION', description: 'Suspensión de fábrica.' },
  },
  FactoryRoutes: {
    CREATE: { action: 'FACTORY_ROUTE_CREATE', description: 'Creación de ruta.' },
    UPDATE: { action: 'FACTORY_ROUTE_UPDATE', description: 'Actualización de datos de ruta.' },
    ACTIVATION: { action: 'FACTORY_ROUTE_ACTIVATION', description: 'Reactivación de ruta.' },
    SUSPENSION: { action: 'FACTORY_ROUTE_SUSPENSION', description: 'Suspensión de ruta.' },
  }
};
