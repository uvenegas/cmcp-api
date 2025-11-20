import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

describe('GenreController', () => {
  let controller: GenreController;
  let service: GenreService;

  const mockGenreService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [{ provide: GenreService, useValue: mockGenreService }],
    }).compile();

    controller = module.get(GenreController);
    service = module.get(GenreService);
    jest.clearAllMocks();
  });

  it('create should call service.create', async () => {
    const dto: CreateGenreDto = { name: 'Terror' };
    const created: any = { id: 1, ...dto };
    (service.create as jest.Mock).mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(created);
  });

  it('findAll should call service.findAll', async () => {
    const list = [{ id: 1, name: 'X' }];
    (service.findAll as jest.Mock).mockResolvedValue(list);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toBe(list);
  });

  it('findOne should call service.findOne with id', async () => {
    const genre = { id: 1, name: 'X' };
    (service.findOne as jest.Mock).mockResolvedValue(genre);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toBe(genre);
  });

  it('update should call service.update', async () => {
    const dto: UpdateGenreDto = { name: 'Updated' };
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
