import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    } as any;

    strategy = new JwtStrategy(configService);
  });

  it('debería crearse correctamente si JWT_SECRET existe', () => {
    expect(strategy).toBeDefined();
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('debería lanzar error si JWT_SECRET no está definido', () => {
    const badConfig = {
      get: jest.fn().mockReturnValue(undefined),
    } as any;

    expect(() => new JwtStrategy(badConfig)).toThrow(
      'JWT_SECRET is not defined in environment variables',
    );
  });

  it('validate() debería retornar el payload transformado', async () => {
    const payload = { sub: 99, email: 'test@mail.com' };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 99,
      email: 'test@mail.com',
    });
  });
});
