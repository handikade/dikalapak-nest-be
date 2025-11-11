import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { productToCatalog } from '../common/adapters/product-to-catalog.adapter';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CatalogListQueryDto } from './dto/catalog-list-query.dto';
import { CatalogDto } from './dto/catalog.dto';

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 8;
const DEFAULT_OFFSET = 0;

@Injectable()
export class CatalogsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(dto: CatalogListQueryDto): Promise<{
    data: CatalogDto[];
    meta: {
      offset: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { limit, offset } = dto;
    const safeOffset = offset ?? DEFAULT_OFFSET;
    const safeLimit = Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const filter = buildFilter(dto);

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(buildSort(dto))
        .skip(safeOffset)
        .limit(safeLimit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data: products.map(productToCatalog),
      meta: {
        offset: safeOffset,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }

  async findById(id: Types.ObjectId): Promise<CatalogDto> {
    const product = await this.productModel
      .findOne({ _id: id, isActive: true })
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with id ${id.toString()} not found`);
    }

    return productToCatalog(product);
  }
}

function buildFilter(dto: CatalogListQueryDto): FilterQuery<ProductDocument> {
  const { category, tags, search, priceMin, priceMax } = dto;
  const filters: FilterQuery<ProductDocument> = { isActive: true };

  if (category) {
    filters.category = category;
  }

  if (Array.isArray(tags) && tags.length) {
    filters.tags = { $in: tags };
  }

  if (search?.trim()) {
    const escapedSearch = escapeRegex(search.trim());
    filters.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    let min = priceMin;
    let max = priceMax;

    if (min !== undefined && max !== undefined && min > max) {
      [min, max] = [max, min];
    }

    const priceFilter: { $gte?: number; $lte?: number } = {};
    if (min !== undefined) {
      priceFilter.$gte = min;
    }
    if (max !== undefined) {
      priceFilter.$lte = max;
    }

    filters.price = priceFilter;
  }

  return filters;
}

function buildSort(dto: CatalogListQueryDto) {
  const { sortBy, sortDirection } = dto;
  const field = sortBy ?? 'createdAt';
  const direction = sortDirection ?? -1;

  return { [field]: direction };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
