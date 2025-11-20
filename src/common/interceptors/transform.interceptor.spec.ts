import { TransformInterceptor } from './transform.interceptor';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor<any>();
  });

  const createContext = (url = '/test'): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ url }),
      }),
    }) as any;

  const createNext = (data: any): CallHandler =>
    ({
      handle: jest.fn(() => of(data)),
    }) as any;

  it('debería envolver la respuesta en el formato ApiResponse', async () => {
    const context = createContext('/books');
    const payload = { id: 1, name: 'Book 1' };
    const next = createNext(payload);

    const result$ = interceptor.intercept(context, next);
    const result = await lastValueFrom(result$);

    expect(next.handle).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(typeof result.timestamp).toBe('string');
    expect(result.timestamp).toContain('T'); // ISO-ish
    expect(result.path).toBe('/books');
    expect(result.data).toEqual(payload);
  });

  it('debería usar la url correcta desde la request', async () => {
    const context = createContext('/custom/path');
    const payload = { ok: true };
    const next = createNext(payload);

    const result$ = interceptor.intercept(context, next);
    const result = await lastValueFrom(result$);

    expect(result.path).toBe('/custom/path');
  });
});
