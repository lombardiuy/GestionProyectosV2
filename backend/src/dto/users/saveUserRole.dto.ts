import { IsString, IsOptional, IsInt, IsArray, ArrayNotEmpty } from "class-validator";

export class SaveUserRoleDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  permissions!: string[];
}
