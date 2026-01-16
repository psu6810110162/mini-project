import { ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  function mockContext(user: any): ExecutionContext {
    return ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown) as ExecutionContext;
  }

  it('allows admin role', () => {
    const ctx = mockContext({ role: 'ADMIN' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws for non-admin role', () => {
    const ctx = mockContext({ role: 'USER' });
    expect(() => guard.canActivate(ctx)).toThrow();
  });
});