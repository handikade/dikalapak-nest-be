import { Type } from 'class-transformer';
import { ArrayUnique, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CatalogDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @Type(() => Number)
  @IsNumber()
  stock: number;

  @IsString()
  category: string;

  @IsString({ each: true })
  @ArrayUnique()
  images: string[];

  @IsString({ each: true })
  @ArrayUnique()
  tags: string[];

  @Type(() => Boolean)
  @IsBoolean()
  isActive: boolean;
}
