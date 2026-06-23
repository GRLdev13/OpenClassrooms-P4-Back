export class LoginUserDto {
  email: string;
  password: string;

  constructor(password: string, email: string) {
    this.password = password;
    this.email = email;
  }
}
