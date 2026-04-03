import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@test.com',
    name: 'Test',
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    constructor: jest.fn().mockImplementation(function (dto) {
      return {
        ...dto,
        save: jest.fn().mockResolvedValue({ ...dto, _id: 'newId' }),
      };
    }),
  };

  // Necesario para que el constructor funcione como mock de clase de Mongoose
  function MockModel(dto: any) {
    this.data = dto;
    this.save = jest.fn().mockResolvedValue({ ...dto, _id: 'newId' });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<User>>(getModelToken(User.name));

    // Añadimos mocks a las funciones estáticas del modelo
    (model as any).findOne = jest.fn();
    (model as any).findById = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByGoogleId', () => {
    it('should call findOne with correct filter', async () => {
      const exec = jest.fn().mockResolvedValue(mockUser);
      (model.findOne as jest.Mock).mockReturnValue({ exec });

      const result = await service.findOneByGoogleId('googleId');

      expect(model.findOne).toHaveBeenCalledWith({ googleId: 'googleId' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneByEmail', () => {
    it('should call findOne and include password if requested', async () => {
      const select = jest.fn().mockReturnThis();
      const exec = jest.fn().mockResolvedValue(mockUser);
      (model.findOne as jest.Mock).mockReturnValue({ select, exec });

      await service.findOneByEmail('test@test.com', true);

      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
      expect(select).toHaveBeenCalledWith('+password');
    });
  });

  describe('findById', () => {
    it('should call findById', async () => {
      const exec = jest.fn().mockResolvedValue(mockUser);
      (model.findById as jest.Mock).mockReturnValue({ exec });

      await service.findById('someId');

      expect(model.findById).toHaveBeenCalledWith('someId');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = { email: 'new@test.com', name: 'New' };
      const result = await service.create(userData);

      expect(result).toHaveProperty('_id', 'newId');
      expect(result.email).toBe(userData.email);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const items = [mockUser];
      (model as any).find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(items),
      });
      (model as any).countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll({ page: 1, size: 10 });

      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply searchTerm and role filters', async () => {
      (model as any).find = jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      (model as any).countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAll({ page: 1, size: 10, filters: { searchTerm: 'test', role: 'admin' as any } });

      expect((model as any).find).toHaveBeenCalledWith(
        expect.objectContaining({ $or: expect.any(Array), roles: 'admin' })
      );
    });
  });

  describe('update', () => {
    it('should call findByIdAndUpdate', async () => {
      (model as any).findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.update('someId', { name: 'Updated' } as any);
      expect((model as any).findByIdAndUpdate).toHaveBeenCalledWith(
        'someId',
        { name: 'Updated' },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should call findByIdAndDelete', async () => {
      (model as any).findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.delete('someId');
      expect((model as any).findByIdAndDelete).toHaveBeenCalledWith('someId');
      expect(result).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('should call findByIdAndUpdate to unset password', async () => {
      (model as any).findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.resetPassword('someId');
      expect((model as any).findByIdAndUpdate).toHaveBeenCalledWith(
        'someId',
        { $unset: { password: 1 } },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('setResetToken', () => {
    it('should call findByIdAndUpdate with token and expiry', async () => {
      const expires = new Date();
      (model as any).findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.setResetToken('someId', 'token123', expires);
      expect((model as any).findByIdAndUpdate).toHaveBeenCalledWith('someId', {
        resetPasswordToken: 'token123',
        resetPasswordExpires: expires,
      });
    });
  });

  describe('findByResetToken', () => {
    it('should call findOne with token filter', async () => {
      (model as any).findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUser),
        }),
      });

      const result = await service.findByResetToken('token123');
      expect((model as any).findOne).toHaveBeenCalledWith({ resetPasswordToken: 'token123' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('applyNewPassword', () => {
    it('should call findByIdAndUpdate to set password and unset token fields', async () => {
      (model as any).findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.applyNewPassword('someId', 'hashedPw');
      expect((model as any).findByIdAndUpdate).toHaveBeenCalledWith('someId', {
        password: 'hashedPw',
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      });
    });
  });
});
