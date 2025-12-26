import { Injectable } from "@angular/core";
import { FileService } from "../../../core/services/file.service";

@Injectable()
export class UploadUserProfilePictureUseCase {

  constructor(private fileService: FileService) {}

  async execute(userId: number, file: File): Promise<void> {

    await this.fileService.save(
      file,
      `user_${userId}/ProfilePic_${userId}`,
      'userProfilePic'
    );
  }
}
