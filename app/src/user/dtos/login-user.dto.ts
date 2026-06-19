export class LoginUserDto {
  email: string;
  passwword: string;

  constructor(password: string, email: string) {
    this.passwword = password;
    this.email = email;
  }
}
