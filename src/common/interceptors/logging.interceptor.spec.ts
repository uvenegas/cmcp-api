import { LoggingInterceptor } from './logging.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const createContext = (user?: { email: string }): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/test',
          user,
        }),
      }),
    }) as any;

  const createNext = (): CallHandler =>
    ({
      handle: jest.fn(() => of('response')),
    }) as any;

  it('debería loguear request y response con usuario autenticado', async () => {
    const context = createContext({ email: 'user@mail.com' });
    const next = createNext();

    const result$ = interceptor.intercept(context, next);
    const result = await lastValueFrom(result$);

    expect(next.handle).toHaveBeenCalled();
    expect(result).toBe('response');

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    const messages = consoleSpy.mock.calls.map((c) => c[0] as string);

    expect(messages[0]).toContain('[REQ]');
    expect(messages[0]).toContain('GET');
    expect(messages[0]).toContain('/test');
    expect(messages[0]).toContain('user@mail.com');

    expect(messages[1]).toContain('[RES]');
    expect(messages[1]).toContain('GET');
    expect(messages[1]).toContain('/test');
    expect(messages[1]).toContain('user@mail.com');
  });

  it('debería usar "anonymous" cuando no hay user en la request', async () => {
    const context = createContext(undefined);
    const next = createNext();

    const result$ = interceptor.intercept(context, next);
    await lastValueFrom(result$);

    const messages = consoleSpy.mock.calls.map((c) => c[0] as string);
    expect(messages[0]).toContain('anonymous');
    expect(messages[1]).toContain('anonymous');
  });
});
