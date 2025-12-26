import { Component, OnInit} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UserProfileFacade } from '../../facades/user-profile.facade';

@Component({
  selector: 'user-profile-page',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  standalone:false
})
export class UserProfilePage implements OnInit {

  constructor(
    public facade: UserProfileFacade,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.facade.initProfile();
  }

  get form() {
    return this.facade.form.controls;
  }

  setprofilePicture(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.facade.setProfilePicture(file);
  }

  updateUserProfile() {
    this.facade.saveProfile();
  }

  changePassword() {
    this.facade.enablePasswordChange();
  }

  hasPermission(code: string) {
    return this.authService.hasPermission(code);
  }
}
