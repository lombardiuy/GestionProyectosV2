import { IsString, IsBoolean, IsInt, MinLength, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsInt()
  userRole!: number; // ID del rol
}
