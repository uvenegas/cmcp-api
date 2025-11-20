import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockAuthService: Partial<jest.Mocked<AuthService>> = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('register should call AuthService.register and return result', async () => {
    const dto: RegisterDto = {
      name: 'Ulises',
      email: 'test@example.com',
      password: '123456',
    };

    const result = { id: 1, name: dto.name, email: dto.email };
    service.register.mockResolvedValue(result as any);

    const response = await controller.register(dto);

    expect(service.register).toHaveBeenCalledWith(dto);
    expect(response).toBe(result);
  });

  it('login should call AuthService.login and return token', async () => {
    const dto: LoginDto = {
      email: 'test@example.com',
      password: '123456',
    };

    const result = { accessToken: 'jwt-token' };
    service.login.mockResolvedValue(result as any);

    const response = await controller.login(dto);

    expect(service.login).toHaveBeenCalledWith(dto);
    expect(response).toBe(result);
  });
});
