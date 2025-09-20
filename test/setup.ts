// Global test setup
import 'reflect-metadata';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock bcrypt to avoid actual hashing in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock JWT service
jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    verify: jest.fn(),
  })),
}));

// Mock TypeORM decorators
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  Repository: jest.fn(),
  Entity: () => (target: any) => target,
  PrimaryGeneratedColumn: () => (_target: any, _propertyKey: string) => {},
  Column: () => (_target: any, _propertyKey: string) => {},
  CreateDateColumn: () => (_target: any, _propertyKey: string) => {},
  UpdateDateColumn: () => (_target: any, _propertyKey: string) => {},
  Between: jest.fn(),
  LessThan: jest.fn(),
  MoreThanOrEqual: jest.fn(),
}));
