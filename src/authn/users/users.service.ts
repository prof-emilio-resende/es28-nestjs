import { Injectable } from '@nestjs/common';
import { Role } from '../../auth/authz.domain';

export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'emilio',
      password: '123@mudar',
      roles: [Role.Writer, Role.Reader],
    },
    {
      userId: 2,
      username: 'resende',
      password: '234@mudar',
      roles: [Role.Reader],
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
