import 'reflect-metadata';
import { validate, EnvironmentVariables } from './env.validation';

describe('Environment Validation', () => {
  it('should validate correct environment variables', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3001',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '15m',
    };

    const result = validate(config);
    expect(result).toBeInstanceOf(EnvironmentVariables);
    expect(result.NODE_ENV).toBe('development');
    expect(result.PORT).toBe(3001);
  });

  it('should throw error for missing required variables', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3001',
      // Missing DATABASE_URL and JWT_SECRET
    };

    expect(() => validate(config)).toThrow();
  });

  it('should throw error for invalid PORT', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: 'invalid-port',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      JWT_SECRET: 'test-secret',
    };

    expect(() => validate(config)).toThrow();
  });
});