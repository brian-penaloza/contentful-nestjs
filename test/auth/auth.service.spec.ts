import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../../src/auth/auth.service';
import { User } from '../../src/auth/entities/user.entity';
import { LoginDto } from '../../src/auth/dto/login.dto';
import { RegisterDto } from '../../src/auth/dto/register.dto';
import {
  mockUsers,
  mockAuthResponses,
  mockHashedPassword,
  mockJwtToken,
  mockJwtPayload,
} from '../mocks/test-data';

describe('AuthService', () => {
  let service: AuthService;
  let _userRepository: Repository<User>;
  let _jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    _userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    _jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = mockUsers.newUser;

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUsers.validUser);
      mockUserRepository.save.mockResolvedValue(mockUsers.validUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(mockHashedPassword as never);

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: mockHashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUsers.validUser);
      expect(result).toEqual(mockAuthResponses.registerSuccess);
    });

    it('should throw error if user already exists', async () => {
      const registerDto: RegisterDto = mockUsers.newUser;

      mockUserRepository.findOne.mockResolvedValue(mockUsers.validUser);

      await expect(service.register(registerDto)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = mockUsers.loginUser;

      mockUserRepository.findOne.mockResolvedValue(mockUsers.validUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockHashedPassword);
      expect(mockJwtService.sign).toHaveBeenCalledWith(mockJwtPayload);
      expect(result).toEqual(mockAuthResponses.loginSuccess);
    });

    it('should throw error if user not found', async () => {
      const loginDto: LoginDto = mockUsers.loginUser;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if password is incorrect', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUsers.validUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });
});
