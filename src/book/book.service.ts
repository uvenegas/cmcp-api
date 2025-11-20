import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Book } from './book.entity';
import { Author } from '../author/author.entity';
import { Genre } from '../genre/genre.entity';
import { Publisher } from '../publisher/publisher.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { GetBooksQueryDto } from './dto/get-books-query.dto';
import { Parser as Json2CsvParser } from 'json2csv'; // <-- para el CSV

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
    @InjectRepository(Publisher)
    private readonly publisherRepo: Repository<Publisher>,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const author = await this.authorRepo.findOne({
      where: { id: dto.authorId },
    });
    if (!author) throw new NotFoundException('Author not found');

    const genre = await this.genreRepo.findOne({ where: { id: dto.genreId } });
    if (!genre) throw new NotFoundException('Genre not found');

    const publisher = await this.publisherRepo.findOne({
      where: { id: dto.publisherId },
    });
    if (!publisher) throw new NotFoundException('Publisher not found');

    const book = this.bookRepo.create({
      title: dto.title,
      price: dto.price,
      available: dto.available ?? true,
      imageUrl: dto.imageUrl ?? null,
      author,
      genre,
      publisher,
    });

    return this.bookRepo.save(book);
  }

  /**
   * Armamos el query con joins + filtros + orden.
   * Lo reutilizamos en findAll() y exportToCsv().
   */
  private buildQuery(query: GetBooksQueryDto): SelectQueryBuilder<Book> {
    const {
      sortBy = 'title',
      sortDir = 'ASC',
      authorId,
      publisherId,
      genreId,
      available,
      search,
    } = query;

    const qb = this.bookRepo
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author')
      .leftJoinAndSelect('book.genre', 'genre')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .where('book.deletedAt IS NULL');

    if (authorId) {
      qb.andWhere('author.id = :authorId', { authorId });
    }

    if (publisherId) {
      qb.andWhere('publisher.id = :publisherId', { publisherId });
    }

    if (genreId) {
      qb.andWhere('genre.id = :genreId', { genreId });
    }

    if (available !== undefined) {
      qb.andWhere('book.available = :available', { available });
    }

    if (search) {
      qb.andWhere('LOWER(book.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const sortColumnMap: Record<string, string> = {
      title: 'book.title',
      price: 'book.price',
      createdAt: 'book.createdAt',
    };

    qb.orderBy(
      sortColumnMap[sortBy] || 'book.title',
      sortDir as 'ASC' | 'DESC',
    );

    return qb;
  }

  /**
   * Listado con filtros + paginación.
   */
  async findAll(query: GetBooksQueryDto): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = query;

    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const qb = this.buildQuery(query);

    qb.skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit: take,
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepo.findOne({
      where: { id },
      relations: ['author', 'genre', 'publisher'],
      withDeleted: false,
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async update(id: number, dto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (dto.title !== undefined) book.title = dto.title;
    if (dto.price !== undefined) book.price = dto.price;
    if (dto.available !== undefined) book.available = dto.available;
    if (dto.imageUrl !== undefined) book.imageUrl = dto.imageUrl;

    if (dto.authorId !== undefined) {
      const author = await this.authorRepo.findOne({
        where: { id: dto.authorId },
      });
      if (!author) throw new NotFoundException('Author not found');
      book.author = author;
    }

    if (dto.genreId !== undefined) {
      const genre = await this.genreRepo.findOne({
        where: { id: dto.genreId },
      });
      if (!genre) throw new NotFoundException('Genre not found');
      book.genre = genre;
    }

    if (dto.publisherId !== undefined) {
      const publisher = await this.publisherRepo.findOne({
        where: { id: dto.publisherId },
      });
      if (!publisher) throw new NotFoundException('Publisher not found');
      book.publisher = publisher;
    }

    return this.bookRepo.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepo.softRemove(book);
  }

  /**
   * Exporta libros a CSV usando separador semicolon (;)
   * compatible con Excel en español.
   */
  async exportToCsv(query: GetBooksQueryDto): Promise<string> {
    const qb = this.buildQuery(query);
    const books = await qb.getMany();

    // Encabezados
    const header = [
      'id',
      'title',
      'price',
      'available',
      'author',
      'genre',
      'publisher',
      'imageUrl',
      'createdAt',
    ];

    // Escapar comillas internas
    const escape = (value: any) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const lines: string[] = [];

    // Primera línea = encabezados
    lines.push(header.join(';'));

    // Contenido
    for (const b of books) {
      lines.push(
        [
          b.id,
          b.title,
          b.price,
          b.available,
          b.author?.name ?? '',
          b.genre?.name ?? '',
          b.publisher?.name ?? '',
          b.imageUrl ?? '',
          b.createdAt?.toISOString?.() ?? '',
        ]
          .map(escape)
          .join(';'),
      );
    }

    return lines.join('\n');
  }
}
