import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class UpdateFactoryRouteDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
  


}
