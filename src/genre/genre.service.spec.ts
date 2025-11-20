import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { GenreService } from './genre.service';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepo = (): MockRepo => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('GenreService', () => {
  let service: GenreService;
  let genreRepo: MockRepo<Genre>;

  beforeEach(async () => {
    genreRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        { provide: getRepositoryToken(Genre), useValue: genreRepo },
      ],
    }).compile();

    service = module.get(GenreService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create should save a new genre', async () => {
    const dto = { name: 'Terror' } as any;
    const created = { id: 1, ...dto } as Genre;

    (genreRepo.create as jest.Mock).mockReturnValue(created);
    (genreRepo.save as jest.Mock).mockResolvedValue(created);

    const result = await service.create(dto);

    expect(genreRepo.create).toHaveBeenCalledWith(dto);
    expect(genreRepo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('findAll should return genres list', async () => {
    const genres = [{ id: 1, name: 'X' }] as Genre[];
    (genreRepo.find as jest.Mock).mockResolvedValue(genres);

    const result = await service.findAll();

    expect(genreRepo.find).toHaveBeenCalled();
    expect(result).toBe(genres);
  });

  it('findOne should return genre when exists', async () => {
    const genre = { id: 1, name: 'X' } as Genre;
    (genreRepo.findOne as jest.Mock).mockResolvedValue(genre);

    const result = await service.findOne(1);

    expect(genreRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(genre);
  });

  it('findOne should throw when not found', async () => {
    (genreRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update should merge and save genre', async () => {
    const existing = { id: 1, name: 'Old' } as Genre;
    jest.spyOn(service, 'findOne').mockResolvedValue(existing);

    const dto = { name: 'New' } as any;
    const saved = { ...existing, ...dto } as Genre;
    (genreRepo.save as jest.Mock).mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(genreRepo.save).toHaveBeenCalledWith({ ...existing, ...dto });
    expect(result).toBe(saved);
  });

  it('remove should call remove with found genre', async () => {
    const existing = { id: 1, name: 'X' } as Genre;
    jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    (genreRepo.remove as jest.Mock).mockResolvedValue(undefined);

    await service.remove(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(genreRepo.remove).toHaveBeenCalledWith(existing);
  });
});
