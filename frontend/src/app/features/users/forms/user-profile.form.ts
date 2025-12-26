import { FormBuilder, FormGroup} from '@angular/forms';
import { passwordsMatchValidator } from '../validators/match-password.validator';


export function createUserProfileForm(fb: FormBuilder): FormGroup {
  return fb.group({
      id: [{ value: null, disabled: true }],
      name: [{ value: '', disabled: true }],
      username: [{ value: '', disabled: true }],
      actualPassword:  [{ value: '', disabled: true }],
      newPassword:  [{ value: '', disabled: true }],
      newPasswordRepeat: [{ value: '', disabled: true }],
      profilePicture: [{ value: null, disabled: true }],
      userRole: [{ value: '', disabled: true }],
      active: [{ value: null, disabled: true }],
      suspended: [{ value: null, disabled: true }]
    },
    {
      validators: [passwordsMatchValidator('newPassword', 'newPasswordRepeat')]
    }
  );
}


