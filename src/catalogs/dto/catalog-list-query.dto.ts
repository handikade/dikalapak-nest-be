import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CatalogListQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsString()
  @IsEnum(['name', 'price', 'createdAt'])
  @IsOptional()
  sortBy?: 'name' | 'price' | 'createdAt';

  @IsNumber()
  @IsEnum([-1, 1])
  @IsOptional()
  sortDirection?: -1 | 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceMax?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priceMin?: number;
}
