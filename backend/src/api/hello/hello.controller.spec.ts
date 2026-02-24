import { Test, TestingModule } from '@nestjs/testing';
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

describe('HelloController', () => {
  let helloController: HelloController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HelloController],
      providers: [HelloService],
    }).compile();

    helloController = app.get<HelloController>(HelloController);
  });

  describe('hello', () => {
    it('should return a hello message', () => {
      expect(helloController.getHello()).toEqual({ message: 'Hello World!' });
    });
  });
});
