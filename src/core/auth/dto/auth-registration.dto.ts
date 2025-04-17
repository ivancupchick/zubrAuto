import { IsEmail, IsNotEmpty, Length, Matches,  } from 'class-validator';

export class RegistationUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Length(3, 32)
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/)
  password: string;
}
