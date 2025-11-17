import { IsInt } from "class-validator";

export class SuspendUserDto {
  @IsInt()
  id!: number;
}
