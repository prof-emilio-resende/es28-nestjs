import { Test, TestingModule } from '@nestjs/testing';
import { AuthnService } from './authn.service';

describe('AuthnService', () => {
  let service: AuthnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthnService],
    }).compile();

    service = module.get<AuthnService>(AuthnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
