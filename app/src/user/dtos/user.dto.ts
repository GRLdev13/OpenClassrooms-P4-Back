import { IsEmail, IsUUID } from 'class-validator';

export class UserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }
}
