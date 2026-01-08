import { Controller, Get } from '@nestjs/common';

@Controller()
export class UsersController {
  @Get('/api/users')
  public getUsers() {
    return [
      { id: 1, name: 'ahmed' },
      { id: 2, name: 'youssef' },
      { id: 3, name: 'omar' },
    ];
  }
}
