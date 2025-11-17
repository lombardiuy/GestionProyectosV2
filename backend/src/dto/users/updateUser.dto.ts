import { IsString, IsBoolean, IsInt, MinLength, IsOptional } from "class-validator";

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  username?: string;


  @IsOptional()
  @IsInt()
  userRole?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  suspended?: boolean;

  @IsOptional()
  @IsBoolean()
  hasProfilePicture?: boolean;
}
