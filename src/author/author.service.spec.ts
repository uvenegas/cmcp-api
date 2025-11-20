import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { Author } from './author.entity';
import { AuthorService } from './author.service';

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

describe('AuthorService', () => {
  let service: AuthorService;
  let authorRepo: MockRepo<Author>;

  beforeEach(async () => {
    authorRepo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        { provide: getRepositoryToken(Author), useValue: authorRepo },
      ],
    }).compile();

    service = module.get(AuthorService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create should save a new author', async () => {
    const dto = { name: 'Stephen King' } as any;
    const created = { id: 1, ...dto } as Author;

    (authorRepo.create as jest.Mock).mockReturnValue(created);
    (authorRepo.save as jest.Mock).mockResolvedValue(created);

    const result = await service.create(dto);

    expect(authorRepo.create).toHaveBeenCalledWith(dto);
    expect(authorRepo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('findAll should return authors list', async () => {
    const authors = [{ id: 1, name: 'A' }] as Author[];
    (authorRepo.find as jest.Mock).mockResolvedValue(authors);

    const result = await service.findAll();

    expect(authorRepo.find).toHaveBeenCalled();
    expect(result).toBe(authors);
  });

  it('findOne should return author when exists', async () => {
    const author = { id: 1, name: 'A' } as Author;
    (authorRepo.findOne as jest.Mock).mockResolvedValue(author);

    const result = await service.findOne(1);

    expect(authorRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(author);
  });

  it('findOne should throw when not found', async () => {
    (authorRepo.findOne as jest.Mock).mockResolvedValue(undefined);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update should merge and save author', async () => {
    const existing = { id: 1, name: 'Old' } as Author;
    jest.spyOn(service, 'findOne').mockResolvedValue(existing);

    const dto = { name: 'New' } as any;
    const saved = { ...existing, ...dto } as Author;
    (authorRepo.save as jest.Mock).mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(authorRepo.save).toHaveBeenCalledWith({ ...existing, ...dto });
    expect(result).toBe(saved);
  });

  it('remove should call remove with found author', async () => {
    const existing = { id: 1, name: 'X' } as Author;
    jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    (authorRepo.remove as jest.Mock).mockResolvedValue(undefined);

    await service.remove(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(authorRepo.remove).toHaveBeenCalledWith(existing);
  });
});
