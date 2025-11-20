import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let repo: jest.Mocked<any>;
  let jwt: jest.Mocked<JwtService>;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwt = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get(AuthService);
    repo = module.get(getRepositoryToken(User));
    jwt = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a user and return token', async () => {
      const dto = {
        name: 'Ulises',
        email: 'test@test.com',
        password: '123456',
      };

      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({
        ...dto,
        passwordHash: 'hashed',
      });

      repo.save.mockResolvedValue({
        id: 1,
        name: dto.name,
        email: dto.email,
      });

      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue('hashed');
      jwt.signAsync.mockResolvedValue('token-123');

      const result = await service.register(dto);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: dto.email },
      });

      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        name: 'Ulises',
        email: 'test@test.com',
        access_token: 'token-123',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      repo.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });

      await expect(
        service.register({
          name: 'Ulises',
          email: 'test@test.com',
          password: '1234',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      const dto = {
        email: 'test@test.com',
        password: '123456',
      };

      repo.findOne.mockResolvedValue({
        id: 1,
        email: dto.email,
        name: 'Ulises',
        passwordHash: 'hashed',
      });

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      jwt.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login(dto);

      expect(result).toEqual({
        id: 1,
        name: 'Ulises',
        email: dto.email,
        access_token: 'jwt-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      repo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        name: 'Ulises',
        passwordHash: 'hashed',
      });

      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
