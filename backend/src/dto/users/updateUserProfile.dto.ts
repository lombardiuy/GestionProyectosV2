import { IsInt, IsOptional, IsString, IsBoolean, MinLength, IsNumber } from "class-validator";

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
  @IsString()
  profilePicture!: string;
  
}
