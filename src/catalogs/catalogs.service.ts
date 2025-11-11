import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { productToCatalog } from '../common/adapters/product-to-catalog.adapter';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CatalogPaginationDto } from './dto/catalog-pagination.dto';
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

  async findAll(dto: CatalogPaginationDto): Promise<{
    data: CatalogDto[];
    meta: {
      offset: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const safeOffset = dto?.offset ?? DEFAULT_OFFSET;
    const safeLimit = Math.min(
      Math.max(1, dto.limit ?? DEFAULT_LIMIT),
      MAX_LIMIT,
    );

    const [products, total] = await Promise.all([
      this.productModel
        .find({ isActive: true })
        .skip(safeOffset)
        .limit(safeLimit)
        .exec(),
      this.productModel.countDocuments({ isActive: true }).exec(),
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
