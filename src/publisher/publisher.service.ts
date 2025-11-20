import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publisher } from './publisher.entity';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';

@Injectable()
export class PublisherService {
  constructor(
    @InjectRepository(Publisher)
    private readonly publisherRepo: Repository<Publisher>,
  ) {}

  create(dto: CreatePublisherDto): Promise<Publisher> {
    const publisher = this.publisherRepo.create(dto);
    return this.publisherRepo.save(publisher);
  }

  findAll(): Promise<Publisher[]> {
    return this.publisherRepo.find();
  }

  async findOne(id: number): Promise<Publisher> {
    const publisher = await this.publisherRepo.findOne({ where: { id } });
    if (!publisher) throw new NotFoundException('Publisher not found');
    return publisher;
  }

  async update(id: number, dto: UpdatePublisherDto): Promise<Publisher> {
    const publisher = await this.findOne(id);
    Object.assign(publisher, dto);
    return this.publisherRepo.save(publisher);
  }

  async remove(id: number): Promise<void> {
    const publisher = await this.findOne(id);
    await this.publisherRepo.remove(publisher);
  }
}
