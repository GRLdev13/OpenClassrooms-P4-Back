import { IsEmail } from 'class-validator';

export class RequestFileDto {
  @IsEmail()
  public email: string;

  constructor(email: string) {
    this.email = email;
  }
}
