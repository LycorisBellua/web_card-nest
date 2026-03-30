import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';

export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signup(createUserDto: CreateUserDto) {
    return await this.userService.addUser(createUserDto);
  }
}
