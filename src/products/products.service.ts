import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';
import { handleValidationError } from '../common/utils/handle-validation-error.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(
    userId: string,
    createProductDto: CreateProductDto,
  ): Promise<ProductDocument> {
    const { isActive, ...rest } = createProductDto;

    try {
      const createdProduct = new this.productModel({
        ...rest,
        userId: new Types.ObjectId(userId),
        isActive: isActive ?? true,
        createdAt: new Date(),
      });

      return await createdProduct.save();
    } catch (error: unknown) {
      handleValidationError(error, 'create', 'product');
    }
  }

  findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async findByUser(userId: string): Promise<ProductDocument[]> {
    return this.productModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    userId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    const updateData: Partial<Product> = {
      ...updateProductDto,
      updatedAt: new Date(),
    };

    let updatedProduct: ProductDocument | null = null;

    try {
      updatedProduct = await this.productModel
        .findOneAndUpdate(
          { _id: id, userId: new Types.ObjectId(userId) },
          updateData,
          { new: true },
        )
        .exec();
    } catch (error: unknown) {
      handleValidationError(error, 'update', 'product');
    }

    if (!updatedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return updatedProduct;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.productModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();

    if (!result) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }
}
