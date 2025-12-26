import { Injectable } from '@angular/core';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SuspendUserUseCase {
  constructor(private userService: UserService) {}

  async execute(user: any) {
    return firstValueFrom(this.userService.suspensionUser(user));
  }
}
