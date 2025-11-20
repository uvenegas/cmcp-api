import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepo: Repository<Author>,
  ) {}

  create(dto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepo.create(dto);
    return this.authorRepo.save(author);
  }

  findAll(): Promise<Author[]> {
    return this.authorRepo.find();
  }

  async findOne(id: number): Promise<Author> {
    const author = await this.authorRepo.findOne({ where: { id } });
    if (!author) throw new NotFoundException('Author not found');
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    Object.assign(author, dto);
    return this.authorRepo.save(author);
  }

  async remove(id: number): Promise<void> {
    const author = await this.findOne(id);
    await this.authorRepo.remove(author);
  }
}
