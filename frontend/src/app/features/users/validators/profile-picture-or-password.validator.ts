import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export const profilePictureOrPasswordValidator = (
  pictureField: string,
  passwordField: string
): ValidatorFn => {

  return (form: AbstractControl): ValidationErrors | null => {

    const pictureCtrl = form.get(pictureField);
    const passwordCtrl = form.get(passwordField);

    if (!pictureCtrl || !passwordCtrl) return null;

    // Solo validar si los controles están habilitados
    if (pictureCtrl.disabled && passwordCtrl.disabled) return null;

    const pictureValue = pictureCtrl.value;
    const passwordValue = passwordCtrl.value;

    const pictureEmpty = !pictureValue;
    const passwordEmpty = !passwordValue || passwordValue.toString().trim() === '';

    if (pictureEmpty && passwordEmpty) {
      return { pictureOrPasswordRequired: true };
    }

    return null;
  };
};
