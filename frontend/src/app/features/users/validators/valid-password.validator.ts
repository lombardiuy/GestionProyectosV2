import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validPasswordValidator(minLength:number): ValidatorFn {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) return null; // deja que required() maneje vacío si lo deseas

    if (value.length < minLength) {
      return { passwordTooShort: { requiredLength: minLength, actualLength: value.length } };
    }

    if (!regex.test(value)) {
      return { passwordComplexity: true };
    }

    return null;
  };
}
