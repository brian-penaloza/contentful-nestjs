import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { mockUsers, mockExpectedResult } from '../mocks/test-data';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call authService.login with correct parameters', async () => {
      mockAuthService.login.mockResolvedValue(mockExpectedResult.login);
      const result = await controller.login(mockUsers.loginUser);
      expect(authService.login).toHaveBeenCalledWith(mockUsers.loginUser);
      expect(result).toEqual(mockExpectedResult.login);
    });
  });

  describe('register', () => {
    it('should call authService.register with correct parameters', async () => {
      mockAuthService.register.mockResolvedValue(mockExpectedResult.register);
      const result = await controller.register(mockUsers.newUser);
      expect(authService.register).toHaveBeenCalledWith(mockUsers.newUser);
      expect(result).toEqual(mockExpectedResult.register);
    });
  });
});
