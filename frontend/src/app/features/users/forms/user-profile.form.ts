import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordsMatchValidator } from '../validators/match-password.validator';
import { notSamePasswordValidator } from '../validators/not-same-password.validator';
import { profilePictureOrPasswordValidator } from '../validators/profile-picture-or-password.validator';

export function createUserProfileForm(fb: FormBuilder): FormGroup {

  return fb.group({
      id: [null, Validators.required],
      name: [{ value: '', disabled: true }, Validators.required],
      username: [{ value: '', disabled: true }, Validators.required],
      actualPassword:  ['', Validators.required],
      newPassword:  ['', Validators.required],
      newPasswordRepeat: ['', Validators.required],
      profilePicture: [null],
      userRole: [{ value: '', disabled: true }, Validators.required],
      active: [{ value: null, disabled: true }, Validators.required],
      suspended: [{ value: null, disabled: true }, Validators.required]
    },
    {
      validators: [
        passwordsMatchValidator('newPassword', 'newPasswordRepeat'),
        notSamePasswordValidator('actualPassword', 'newPassword'),
        profilePictureOrPasswordValidator('profilePicture', 'actualPassword')
      ]
    }
  );
}


