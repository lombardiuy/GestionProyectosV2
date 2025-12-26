import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validUsername } from '../validators/valid-username.validator';
import { noLeadingSpaceValidator } from '../validators/no-leading-space.validator';


export function createUserForm(fb: FormBuilder): FormGroup {
  return fb.group({
    id: [null],
    name: ['', [Validators.required, Validators.minLength(6),noLeadingSpaceValidator]],
    username: ['', Validators.required],
    password: [''],
    profilePicture: [null],
    userRole: [null, Validators.required],
    active: [false],
    suspended: [false]
  }, {
    validator: validUsername('name')
  });
}
