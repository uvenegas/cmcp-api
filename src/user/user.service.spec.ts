import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

type MockRepo = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  remove: jest.Mock;
};

const createMockRepo = (): MockRepo => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create success', async () => {
    const dto = { name: 'Ulises', email: 'u@test.com', password: '123456' };

    repo.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed123');

    const created = { id: 1, ...dto, passwordHash: 'hashed123' } as any;
    repo.create.mockReturnValue(created);
    repo.save.mockResolvedValue(created);

    const result = await service.create(dto);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
    expect(repo.create).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      passwordHash: 'hashed123',
    });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('create should throw ConflictException if email exists', async () => {
    repo.findOne.mockResolvedValue({ id: 1, email: 'u@test.com' } as User);

    const dto: any = { name: 'X', email: 'u@test.com', password: '123' };

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll success', async () => {
    const users = [{ id: 1 }, { id: 2 }] as User[];
    repo.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('findOne success', async () => {
    const user = { id: 1 } as User;
    repo.findOne.mockResolvedValue(user);

    const result = await service.findOne(1);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(user);
  });

  it('findOne not found', async () => {
    repo.findOne.mockResolvedValue(undefined);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update success', async () => {
    const existing = { id: 1, name: 'Old' } as any;
    const dto = { name: 'New' };

    jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    repo.save.mockResolvedValue({ ...existing, ...dto });

    const result = await service.update(1, dto);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(repo.save).toHaveBeenCalledWith({ ...existing, ...dto });
    expect(result).toEqual({ id: 1, name: 'New' });
  });

  it('remove success', async () => {
    const user = { id: 1 } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(user);
    repo.remove.mockResolvedValue(undefined);

    await service.remove(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(repo.remove).toHaveBeenCalledWith(user);
  });
});
