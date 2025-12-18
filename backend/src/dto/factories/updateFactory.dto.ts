import { IsString, IsBoolean, IsOptional } from "class-validator";

export class UpdateFactoryDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  hasProfilePicture?: boolean;
}
