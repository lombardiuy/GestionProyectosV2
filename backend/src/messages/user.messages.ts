// src/constants/messages.ts

export const USER_ERRORS = {
  NOT_FOUND: 'Usuario desconocido. Si el error persiste contacte al administrador.',
  USERNAME_EXISTS: 'El usuario ya existe.',
  PASSWORD_INVALID: 'Contraseña actual incorrecta.',
  PASSWORD_SAME: 'La nueva contraseña debe ser diferente a la actual.',
  PASSWORD_REQUIRED: 'Debe enviar una nueva contraseña válida.',
};

export const ROLE_ERRORS = {
  NOT_FOUND: 'Rol no encontrado.',
  NAME_EXISTS: 'Ya existe un rol con el mismo nombre.',
  PERMISSIONS_EMPTY: 'Debe asignar al menos 1 permiso al rol.',
};

export const AUDIT_ACTIONS = {
  Users: {
    CREATE: { action: 'USER_CREATE', description: 'Creación de usuario.' },
    UPDATE: { action: 'USER_UPDATE', description: 'Actualización de configuración de usuario.' },
    PASSWORD_CHANGE: { action: 'USER_PASSWORD_CHANGE', description: 'Cambio de contraseña del usuario.' },
    PROFILE_UPDATE: { action: 'USER_PROFILE_UPDATE', description: 'Actualización de perfil y contraseña.' },
    PROFILE_PICTURE_UPDATE: { action: 'USER_PROFILE_PICTURE_UPDATE', description: 'Actualización de foto de perfil de usuario.' },
    PASSWORD_SET: { action: 'USER_PASSWORD_SET', description: 'Actualización de contraseña del usuario.' },
    PASSWORD_RESET: { action: 'USER_PASSWORD_RESET', description: 'Reset de contraseña.' },
    SUSPENSION: { action: 'USER_SUSPENSION', description: 'Suspensión de usuario.' },
    ACTIVATION: { action: 'USER_ACTIVATION', description: 'Reactivación de usuario.' },
  },
  Roles: {
    CREATE: { action: 'USER_ROLE_CREATE', description: 'Creación de rol.' },
    UPDATE: { action: 'USER_ROLE_UPDATE', description: 'Actualización de rol por cambio de permisos.' },
  }
};


