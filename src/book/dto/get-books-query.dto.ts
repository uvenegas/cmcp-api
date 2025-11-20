import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetBooksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsIn(['title', 'price', 'createdAt'])
  sortBy?: 'title' | 'price' | 'createdAt' = 'title';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortDir?: 'ASC' | 'DESC' = 'ASC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  authorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  publisherId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  genreId?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
