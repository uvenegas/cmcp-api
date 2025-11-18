import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Author } from '../author/author.entity';
import { Publisher } from '../publisher/publisher.entity';
import { Genre } from '../genre/genre.entity';

@Entity({ name: 'books' })
@Index(['title'])
@Index(['available'])
@Index(['genre'])
@Index(['author'])
@Index(['publisher'])
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('numeric', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Author, (author) => author.books, { eager: true })
  author: Author;

  @ManyToOne(() => Publisher, (publisher) => publisher.books, { eager: true })
  publisher: Publisher;

  @ManyToOne(() => Genre, (genre) => genre.books, { eager: true })
  genre: Genre;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date | null;
}
