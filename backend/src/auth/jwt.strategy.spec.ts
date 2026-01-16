import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  it('validate should return user payload for valid token payload', async () => {
    const config = { get: () => 'secret' } as unknown as ConfigService;
    const strat = new JwtStrategy(config);

    const payload = { sub: 1, username: 'u', role: 'ADMIN' };
    const result = await strat.validate(payload as any);
    expect(result).toEqual({ userId: 1, username: 'u', role: 'ADMIN' });
  });

  it('validate should throw if payload missing', async () => {
    const config = { get: () => 'secret' } as unknown as ConfigService;
    const strat = new JwtStrategy(config);
    await expect(strat.validate({} as any)).rejects.toThrow();
  });
});