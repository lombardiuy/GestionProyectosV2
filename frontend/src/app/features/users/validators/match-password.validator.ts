import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(passwordKey: string, passwordRepeatKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const passwordRepeat = group.get(passwordRepeatKey)?.value;

    if (password !== passwordRepeat) {
      group.get(passwordRepeatKey)?.setErrors({ areEqual: true });
      return { areEqual: true };
    }

    // Eliminar el error si coinciden
    const errors = group.get(passwordRepeatKey)?.errors;
    if (errors) {
      delete errors['areEqual'];
      if (Object.keys(errors).length === 0) {
        group.get(passwordRepeatKey)?.setErrors(null);
      }
    }

    return null;
  };
}