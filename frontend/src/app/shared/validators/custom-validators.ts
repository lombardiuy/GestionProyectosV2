import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function allowedValuesValidator(allowed: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return allowed.includes(control.value) ? null : { invalidStatus: true };
  };
}
