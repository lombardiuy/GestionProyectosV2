import { IsInt } from "class-validator";

export class SuspendFactoryRouteDto {
  @IsInt()
  id!: number;
}
