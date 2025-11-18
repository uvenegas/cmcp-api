import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { Author } from '../author/author.entity';
import { Publisher } from '../publisher/publisher.entity';
import { Genre } from '../genre/genre.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Author, Publisher, Genre])],
  controllers: [BookController],
  providers: [BookService],
})
export class BookModule {}
