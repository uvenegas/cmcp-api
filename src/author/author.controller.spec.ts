import { Test, TestingModule } from '@nestjs/testing';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

describe('AuthorController', () => {
  let controller: AuthorController;
  let service: AuthorService;

  const mockAuthorService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorController],
      providers: [{ provide: AuthorService, useValue: mockAuthorService }],
    }).compile();

    controller = module.get(AuthorController);
    service = module.get(AuthorService);
    jest.clearAllMocks();
  });

  it('create should call service.create', async () => {
    const dto: CreateAuthorDto = { name: 'Stephen King' };
    const created: any = { id: 1, ...dto };
    (service.create as jest.Mock).mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(created);
  });

  it('findAll should call service.findAll', async () => {
    const list = [{ id: 1, name: 'A' }];
    (service.findAll as jest.Mock).mockResolvedValue(list);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toBe(list);
  });

  it('findOne should call service.findOne with id', async () => {
    const author = { id: 1, name: 'A' };
    (service.findOne as jest.Mock).mockResolvedValue(author);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toBe(author);
  });

  it('update should call service.update', async () => {
    const dto: UpdateAuthorDto = { name: 'Updated' };
    const updated = { id: 1, name: 'Updated' };
    (service.update as jest.Mock).mockResolvedValue(updated);

    const result = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toBe(updated);
  });

  it('remove should call service.remove', async () => {
    (service.remove as jest.Mock).mockResolvedValue(undefined);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toBeUndefined();
  });
});
