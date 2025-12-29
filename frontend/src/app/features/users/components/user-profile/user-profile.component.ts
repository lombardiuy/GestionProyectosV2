import { Component, Input } from '@angular/core';
import { UserProfileFacade } from '../../facades/user-profile.facade';


@Component({
  selector: 'user-profile-component',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone:false
})



export class UserProfileComponent {
  @Input() facade!: UserProfileFacade;
  @Input() hasPermission!: (code: string) => boolean;

  get form() {
    return this.facade.form.controls;
  }

  setProfilePicture(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.facade.setProfilePicture(file);
  }

  save() {
    this.facade.saveProfile();
  }

  changePassword() {
    this.facade.enablePasswordChange();
  }
}