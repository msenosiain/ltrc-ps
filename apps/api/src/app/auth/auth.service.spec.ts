import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MailerService } from './mailer.service';
import { BadRequestException, ConflictException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/schemas/user.schema';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let usersService: UsersService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@test.com',
    password: 'hashedPassword',
    name: 'Test User',
    roles: ['user'],
  } as unknown as User;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockToken'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
  };

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
    setResetToken: jest.fn(),
    findByResetToken: jest.fn(),
    applyNewPassword: jest.fn(),
  };

  const mockMailerService = {
    sendPasswordReset: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: MailerService, useValue: mockMailerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@test.com' })
      ).rejects.toThrow(ConflictException);
    });

    it('should hash password and create user', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register({
        email: 'test@test.com',
        password: 'password',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@test.com', 'wrongpass')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should return tokens if login is successful', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'hashedPassword');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });
  });

  describe('refreshToken', () => {
    it('should return a new access token', () => {
      const result = service.refreshToken(mockUser);
      expect(result).toHaveProperty('access_token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('login — pending activation', () => {
    it('should throw HttpException with ACCOUNT_PENDING_ACTIVATION when user has no password', async () => {
      const pendingUser = { ...mockUser, password: undefined };
      mockUsersService.findOneByEmail.mockResolvedValue(pendingUser);

      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(HttpException);
    });
  });

  describe('activateAccount', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.activateAccount('unknown@test.com', 'pass')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if account already has password', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      await expect(service.activateAccount('test@test.com', 'pass')).rejects.toThrow(BadRequestException);
    });

    it('should hash password, save, and return tokens for a pending account', async () => {
      const pendingUser = {
        ...mockUser,
        password: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUsersService.findOneByEmail.mockResolvedValue(pendingUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

      const result = await service.activateAccount('test@test.com', 'newPass');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPass', 10);
      expect(pendingUser.save).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });
  });

  describe('forgotPassword', () => {
    it('should silently succeed when user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      await expect(service.forgotPassword('unknown@test.com')).resolves.toBeUndefined();
    });

    it('should set reset token and send email when user found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      mockUsersService.setResetToken.mockResolvedValue(undefined);
      mockMailerService.sendPasswordReset.mockResolvedValue(undefined);

      await service.forgotPassword('test@test.com');

      expect(mockUsersService.setResetToken).toHaveBeenCalledWith(
        mockUser._id,
        expect.any(String),
        expect.any(Date),
      );
      expect(mockMailerService.sendPasswordReset).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.name,
        expect.any(String),
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException when token is invalid', async () => {
      mockUsersService.findByResetToken.mockResolvedValue(null);
      await expect(service.resetPassword('bad-token', 'newPass')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when token is expired', async () => {
      const expiredUser = {
        ...mockUser,
        resetPasswordExpires: new Date(Date.now() - 10000),
      };
      mockUsersService.findByResetToken.mockResolvedValue(expiredUser);
      await expect(service.resetPassword('token', 'newPass')).rejects.toThrow(BadRequestException);
    });

    it('should hash password and apply when token is valid', async () => {
      const validUser = {
        ...mockUser,
        resetPasswordExpires: new Date(Date.now() + 3600000),
      };
      mockUsersService.findByResetToken.mockResolvedValue(validUser);
      mockUsersService.applyNewPassword.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNew');

      await service.resetPassword('good-token', 'newPass');

      expect(bcrypt.hash).toHaveBeenCalledWith('newPass', 10);
      expect(mockUsersService.applyNewPassword).toHaveBeenCalledWith(
        mockUser._id,
        'hashedNew',
      );
    });
  });
});
