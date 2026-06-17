import { GetFileDto } from "../../file/dtos/file.dto";

export class UserDto {
  id: string;
  email: string;

  constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }
}

export class CreateUserDto {
  email: string;
  password: string;
  firstname: string;
  lastname: string;

  constructor(email: string, password: string, firstname: string, lastname: string) {
    this.email = email;
    this.password = password;
    this.firstname = password;
    this.lastname = password;
  }
}

export class LoginDto {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class ConnectedDto {
  constructor(
    public id: string,
    public email: string,
    public firstname: string,
    public lastname: string,
    public token: string,
    public files: GetFileDto[] = [],
    public picture = '',
  ) {}
}
