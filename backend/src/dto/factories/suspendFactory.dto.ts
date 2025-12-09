import { IsInt } from "class-validator";

export class SuspendFactoryDto {
  @IsInt()
  id!: number;
}
