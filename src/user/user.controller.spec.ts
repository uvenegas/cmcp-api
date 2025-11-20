import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/Auth/jwt.auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUserService: jest.Mocked<UserService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as any;

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create debe delegar al servicio', async () => {
    const dto: any = {
      name: 'Ulises',
      email: 'u@test.com',
      password: '123456',
    };
    const created: any = { id: 1, ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('findAll debe delegar al servicio', async () => {
    const users: any[] = [{ id: 1 }, { id: 2 }];
    service.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('findOne debe delegar al servicio', async () => {
    const user: any = { id: 1, name: 'Test' };
    service.findOne.mockResolvedValue(user);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });

  it('update debe delegar al servicio', async () => {
    const dto: any = { name: 'Nuevo nombre' };
    const updated: any = { id: 1, ...dto };
    service.update.mockResolvedValue(updated);

    const result = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(updated);
  });

  it('remove debe delegar al servicio', async () => {
    service.remove.mockResolvedValue(undefined as any);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toBeUndefined();
  });
});
