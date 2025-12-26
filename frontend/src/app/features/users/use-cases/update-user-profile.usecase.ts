import { Injectable } from "@angular/core";
import { UserService } from "../services/user.service";

@Injectable()
export class UpdateUserProfileUseCase {

  constructor(private userService: UserService) {}

  async execute(data: {
    id: number;
    actualPassword: string;
    newPassword: string;
    profilePicture: string;
  }): Promise<any> {

    return await this.userService.updateUserProfile(
      data.id,
      data.actualPassword,
      data.newPassword,
      data.profilePicture
    ).toPromise();
  }
}
