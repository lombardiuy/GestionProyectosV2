import { IsInt } from "class-validator";

export class ResetUserPasswordDto {
  @IsInt()
  id!: number;
}
