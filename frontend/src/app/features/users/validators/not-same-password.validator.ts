import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notSamePasswordValidator(
  currentPasswordKey: string,
  newPasswordKey: string
): ValidatorFn {

  return (group: AbstractControl): ValidationErrors | null => {


    const current = group.get(currentPasswordKey)?.value;
    const next = group.get(newPasswordKey)?.value;
    console.log(current, next)

    if (!current || !next) return null;

    if (current === next) {
      console.log("ERROR")
      group.get(newPasswordKey)?.setErrors({ sameAsCurrent: true });
      return { sameAsCurrent: true };
    }

    // eliminar error cuando deja de coincidir
    const errors = group.get(newPasswordKey)?.errors;
    if (errors) {
      delete errors['sameAsCurrent'];
      if (Object.keys(errors).length === 0) {
        group.get(newPasswordKey)?.setErrors(null);
      }
    }


    return null;
  };
}
