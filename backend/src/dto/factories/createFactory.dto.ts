import { IsString, IsNotEmpty, IsBoolean } from "class-validator";

export class CreateFactoryDto {

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;


  @IsBoolean()
  hasProfilePicture!: boolean;

  @IsString()
  @IsNotEmpty()
  contact!: string;
  

}
