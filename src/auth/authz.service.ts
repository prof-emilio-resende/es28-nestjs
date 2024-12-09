import { Injectable } from '@nestjs/common';
import { Role } from './authz.domain';

@Injectable()
export class AuthzService {
  private keyRoles = {
    supersafe: [Role.Reader, Role.Writer],
    supersafev2: [Role.Reader, Role.Writer],
    supersafevn: [Role.Reader],
  };

  getRolesFromKey(key: string): Role[] {
    return this.keyRoles[key];
  }
}
