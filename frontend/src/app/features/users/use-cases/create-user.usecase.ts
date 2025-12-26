import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../services/user.service';
import { FileService } from '../../../core/services/file.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private userService: UserService,
    private fileService: FileService
  ) {}

  async execute(user: any, profilePicture?: File) {
    const res = await firstValueFrom(this.userService.createUser(user));
    if (profilePicture) {
      await this.fileService.save(profilePicture, `user_${res.user.id}/ProfilePic_${res.user.id}`, 'userProfilePic');
    }
    return res;
  }
}
