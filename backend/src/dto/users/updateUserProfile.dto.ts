import { IsInt, IsOptional, IsString, IsBoolean, MinLength } from "class-validator";

export class UpdateUserProfileDto {
  @IsInt()
  userID!: number;

  @IsOptional()
  @IsString()
  actualPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;

  @IsOptional()
  @IsBoolean()
  hasProfilePicture?: boolean;
}
