import { Test, TestingModule } from '@nestjs/testing';
import { AuthnController } from './authn.controller';

describe('AuthnController', () => {
  let controller: AuthnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthnController],
    }).compile();

    controller = module.get<AuthnController>(AuthnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
