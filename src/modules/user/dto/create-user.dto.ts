import { RealField } from "src/temp/entities/Field";
import { ServerUser } from "src/temp/entities/User";
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto implements ServerUser.CreateRequest {
  fields: RealField.Request[];

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Length(3, 32)
  @IsNotEmpty()
  password: string;
  isActivated: boolean;
  roleLevel: number;
  deleted: boolean;
}

// export class CreateUserDto {}
