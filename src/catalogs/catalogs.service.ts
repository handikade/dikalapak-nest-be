import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { productToCatalog } from '../common/adapters/product-to-catalog.adapter';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CatalogDto } from './dto/catalog.dto';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<CatalogDto[]> {
    // return this.productModel.find().exec();
    const products = await this.productModel.find({ isActive: true }).exec();

    return products.map(productToCatalog);
  }

  async findById(id: Types.ObjectId): Promise<CatalogDto> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException(`Product with id ${id.toString()} not found`);
    }

    return productToCatalog(product);
  }
}
