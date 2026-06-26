import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  passwordConfirmation: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  constructor(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    passwordConfirmation: string,
  ) {
    this.email = email;
    this.password = password;
    this.passwordConfirmation = passwordConfirmation;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}
