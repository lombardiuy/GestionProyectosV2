import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noLeadingSpaceValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const value = control.value as string;

  if (typeof value !== 'string') return null;

  return value.startsWith(' ')
    ? { leadingSpace: true }
    : null;
};
