import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class CreateFactoryRouteDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
  
  @IsInt()
  factory!: number;

  

}
