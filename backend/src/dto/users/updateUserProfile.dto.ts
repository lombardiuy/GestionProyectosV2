import { IsInt, IsOptional, IsString, IsBoolean, MinLength } from "class-validator";

export class UpdateUserProfileDto {
  @IsInt()
  userID!: number;

  @IsOptional()
  @IsString()
  actualPassword?: string;

  @IsOptional()
  @IsString()
  newPassword?: string;

  @IsOptional()
  @IsBoolean()
  hasProfilePicture?: boolean;
}
