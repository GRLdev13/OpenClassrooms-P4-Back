import { Injectable } from '@nestjs/common';
import { User } from '../entities/user';
import { exitCode } from 'process';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getTest(id:string): User {
    //todo error handling
    let user = User.findById(id).then(x => {
      if(x)
        return user; 
      else
        throw exitCode;
    });

    return user;
  }
}

@Injectable()
export class TestService {

}