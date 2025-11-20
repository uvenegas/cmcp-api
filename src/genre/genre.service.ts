import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './genre.entity';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenreService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepo: Repository<Genre>,
  ) {}

  create(dto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepo.create(dto);
    return this.genreRepo.save(genre);
  }

  findAll(): Promise<Genre[]> {
    return this.genreRepo.find();
  }

  async findOne(id: number): Promise<Genre> {
    const genre = await this.genreRepo.findOne({ where: { id } });
    if (!genre) throw new NotFoundException('Genre not found');
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);
    Object.assign(genre, dto);
    return this.genreRepo.save(genre);
  }

  async remove(id: number): Promise<void> {
    const genre = await this.findOne(id);
    await this.genreRepo.remove(genre);
  }
}
