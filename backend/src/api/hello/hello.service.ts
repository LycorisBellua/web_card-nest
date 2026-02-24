import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHello(): { message: string } {
    return { message: 'Hello World!' };
  }
}
