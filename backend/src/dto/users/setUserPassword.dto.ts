import { IsInt, IsString, MinLength } from "class-validator";

export class SetUserPasswordDto {
  @IsInt()
  id!: number;

  @IsString()
  @MinLength(8)
  password!: string;
}
