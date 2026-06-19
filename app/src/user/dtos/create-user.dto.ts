export class CreateUserDto {
  email: string;
  password: string;
  firstname: string;
  lastname: string;

  constructor(
    email: string,
    password: string,
    firstname: string,
    lastname: string,
  ) {
    this.email = email;
    this.password = password;
    this.firstname = password;
    this.lastname = password;
  }
}
