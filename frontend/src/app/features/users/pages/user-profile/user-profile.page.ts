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

  hasPermission(code: string) {
    return this.authService.hasPermission(code);
  }
}