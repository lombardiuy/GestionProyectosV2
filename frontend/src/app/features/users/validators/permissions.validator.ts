import { FormGroup } from '@angular/forms';

export interface PermissionMap {
  [parent: string]: string[]; // padre -> hijos
}

export class PermissionsValidator {

  static listenPermissions(
    form: FormGroup,
    permissionDependencies: PermissionMap,
    callback?: (permission: string, value: boolean) => void
  ) {
    // Construimos mapa hijo -> padres automáticamente
    const childToParents: { [child: string]: string[] } = {};
    Object.keys(permissionDependencies).forEach(parent => {
      permissionDependencies[parent].forEach(child => {
        if (!childToParents[child]) childToParents[child] = [];
        childToParents[child].push(parent);
      });
    });

    Object.keys(form.controls).forEach(controlName => {
      form.get(controlName)?.valueChanges.subscribe((value: boolean) => {

        if (value) {
          // Si se activa un hijo, activamos padres
          (childToParents[controlName] || []).forEach(parent => {
            if (!form.get(parent)?.value) {
              form.patchValue({ [parent]: true }, { emitEvent: false });
            }
          });
        } else {
          // Si se desactiva un padre, desactivamos hijos
          if (permissionDependencies[controlName]) {
            permissionDependencies[controlName].forEach(child => {
              if (form.get(child)?.value) {
                form.patchValue({ [child]: false }, { emitEvent: false });
              }
            });
          }
        }

        if (callback) callback(controlName, value);
      });
    });
  }
}
