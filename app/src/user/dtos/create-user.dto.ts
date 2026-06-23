export class CreateUserDto {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
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
