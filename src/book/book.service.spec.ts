import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

import { BookService } from './book.service';
import { Author } from '../author/author.entity';
import { Genre } from '../genre/genre.entity';
import { Publisher } from '../publisher/publisher.entity';
import { Book } from '../book/book.entity';

type MockRepo<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T> | 'createQueryBuilder', jest.Mock>
>;

const createMockRepo = (): MockRepo => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

type MockQb = {
  leftJoinAndSelect: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  orderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  getManyAndCount: jest.Mock;
  getMany: jest.Mock;
};

const createMockQb = (): MockQb =>
  ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
  }) as any;

describe('BookService', () => {
  let service: BookService;
  let bookRepo: MockRepo<Book>;
  let authorRepo: MockRepo<Author>;
  let genreRepo: MockRepo<Genre>;
  let publisherRepo: MockRepo<Publisher>;
  let qb: MockQb;

  beforeEach(async () => {
    bookRepo = createMockRepo();
    authorRepo = createMockRepo();
    genreRepo = createMockRepo();
    publisherRepo = createMockRepo();
    qb = createMockQb();

    (bookRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        { provide: getRepositoryToken(Book), useValue: bookRepo },
        { provide: getRepositoryToken(Author), useValue: authorRepo },
        { provide: getRepositoryToken(Genre), useValue: genreRepo },
        { provide: getRepositoryToken(Publisher), useValue: publisherRepo },
      ],
    }).compile();

    service = module.get(BookService);
  });

  afterEach(() => jest.clearAllMocks());

  it('create success', async () => {
    const author = { id: 1, name: 'Author' } as Author;
    const genre = { id: 2, name: 'Genre' } as Genre;
    const publisher = { id: 3, name: 'Publisher' } as Publisher;

    (authorRepo.findOne as jest.Mock).mockResolvedValue(author);
    (genreRepo.findOne as jest.Mock).mockResolvedValue(genre);
    (publisherRepo.findOne as jest.Mock).mockResolvedValue(publisher);

    const created = { id: 10 } as Book;
    (bookRepo.create as jest.Mock).mockReturnValue(created);
    (bookRepo.save as jest.Mock).mockResolvedValue(created);

    const dto: any = {
      title: 'Test book',
      price: 1000,
      available: true,
      imageUrl: '/img.png',
      authorId: 1,
      genreId: 2,
      publisherId: 3,
    };

    const result = await service.create(dto);

    expect(authorRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(genreRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    expect(publisherRepo.findOne).toHaveBeenCalledWith({ where: { id: 3 } });

    expect(bookRepo.create).toHaveBeenCalledWith({
      title: dto.title,
      price: dto.price,
      available: dto.available,
      imageUrl: dto.imageUrl,
      author,
      genre,
      publisher,
    });
    expect(bookRepo.save).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('create not found', async () => {
    (authorRepo.findOne as jest.Mock).mockResolvedValue(undefined);

    await expect(
      service.create({
        title: 'x',
        price: 1,
        available: true,
        imageUrl: null,
        authorId: 1,
        genreId: 2,
        publisherId: 3,
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll success', async () => {
    const books = [{ id: 1 } as Book];
    qb.getManyAndCount.mockResolvedValue([books, 1]);

    const result = await service.findAll({ page: 2, limit: 10 } as any);

    expect(qb.skip).toHaveBeenCalledWith(10);
    expect(qb.take).toHaveBeenCalledWith(10);
    expect(qb.getManyAndCount).toHaveBeenCalled();

    expect(result).toEqual({
      data: books,
      total: 1,
      page: 2,
      limit: 10,
    });
  });

  it('findOne success', async () => {
    const book = { id: 1 } as Book;
    (bookRepo.findOne as jest.Mock).mockResolvedValue(book);

    const result = await service.findOne(1);

    expect(bookRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['author', 'genre', 'publisher'],
      withDeleted: false,
    });
    expect(result).toBe(book);
  });

  it('findOne not found', async () => {
    (bookRepo.findOne as jest.Mock).mockResolvedValue(undefined);

    await expect(service.findOne(123)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update success', async () => {
    const existing = {
      id: 1,
      title: 'Old',
      price: 100,
      available: false,
      imageUrl: null,
    } as any;

    jest.spyOn(service, 'findOne').mockResolvedValue(existing);

    const newAuthor = { id: 5 } as Author;
    (authorRepo.findOne as jest.Mock).mockResolvedValue(newAuthor);

    const dto: any = {
      title: 'New',
      price: 200,
      available: true,
      imageUrl: '/new.png',
      authorId: 5,
    };

    const saved = { ...existing, ...dto, author: newAuthor } as Book;
    (bookRepo.save as jest.Mock).mockResolvedValue(saved);

    const result = await service.update(1, dto);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(authorRepo.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
    expect(bookRepo.save).toHaveBeenCalledWith({
      ...existing,
      title: dto.title,
      price: dto.price,
      available: dto.available,
      imageUrl: dto.imageUrl,
      author: newAuthor,
    });
    expect(result).toBe(saved);
  });

  it('update not found', async () => {
    const existing = { id: 1 } as any;
    jest.spyOn(service, 'findOne').mockResolvedValue(existing);
    (authorRepo.findOne as jest.Mock).mockResolvedValue(undefined);

    await expect(
      service.update(1, { authorId: 999 } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('remove success', async () => {
    const book = { id: 1 } as Book;
    jest.spyOn(service, 'findOne').mockResolvedValue(book);
    (bookRepo.softRemove as jest.Mock).mockResolvedValue(undefined);

    await service.remove(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(bookRepo.softRemove).toHaveBeenCalledWith(book);
  });

  it('exportToCsv success', async () => {
    const createdAt = new Date('2025-01-01T00:00:00.000Z');

    const books: Book[] = [
      {
        id: 1,
        title: 'La pollera 2',
        price: 20000,
        available: false,
        imageUrl: '/uploads/books/1.webp',
        createdAt,
        author: { id: 1, name: 'Stephen King' } as any,
        genre: { id: 2, name: 'Acción' } as any,
        publisher: { id: 3, name: 'Alex' } as any,
      } as any,
    ];

    qb.getMany.mockResolvedValue(books);

    const csv = await service.exportToCsv({} as any);

    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);

    const header = lines[0];
    expect(header).toBe(
      [
        'id',
        'title',
        'price',
        'available',
        'author',
        'genre',
        'publisher',
        'imageUrl',
        'createdAt',
      ].join(';'),
    );

    const row = lines[1];
    expect(row).toContain('"La pollera 2"');
    expect(row).toContain('"Stephen King"');
    expect(row).toContain('"Acción"');
    expect(row).toContain('"Alex"');
    expect(row).toContain(createdAt.toISOString());
  });
});
