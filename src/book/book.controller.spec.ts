import { Test, TestingModule } from '@nestjs/testing';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { NotFoundException } from '@nestjs/common';

describe('BookController', () => {
  let controller: BookController;
  let service: jest.Mocked<BookService>;

  beforeEach(async () => {
    const mockService: jest.Mocked<BookService> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      exportToCsv: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(BookController);
    service = module.get(BookService);
  });

  it('should create a book', async () => {
    const dto: any = { title: 'Test' };
    service.create.mockResolvedValue({ id: 1, ...dto } as any);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should return all books', async () => {
    const query: any = { page: 1, limit: 10 };
    const response = { data: [], total: 0, page: 1, limit: 10 };
    service.findAll.mockResolvedValue(response);

    const result = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(response);
  });

  it('should return one book', async () => {
    const book = { id: 1 };
    service.findOne.mockResolvedValue(book as any);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toBe(book);
  });

  it('should update a book', async () => {
    const dto = { title: 'Updated' };
    const updated = { id: 1, title: 'Updated' };
    service.update.mockResolvedValue(updated as any);

    const result = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toBe(updated);
  });

  it('should remove a book', async () => {
    service.remove.mockResolvedValue(undefined);

    const result = await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toBeUndefined();
  });

  it('should export CSV', async () => {
    service.exportToCsv.mockResolvedValue('id;title\n1;Book');

    const result = await controller.exportCsv({} as any);

    expect(service.exportToCsv).toHaveBeenCalled();
    expect(result).toBe('id;title\n1;Book');
  });

  it('should upload image and return URL', () => {
    const file = { filename: '123.png' };

    const result = controller.uploadImage(file);

    expect(result).toEqual({ url: '/uploads/books/123.png' });
  });

  it('should return null url when no file uploaded', () => {
    const result = controller.uploadImage(null);

    expect(result).toEqual({ url: null });
  });
});
