import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /*
  Example:
  curl -X POST {{local_url}}/products \
    -H "Content-Type: application/json" \
    -d '{"name":"Desk Lamp","price":45.5,"category":"lighting","userId":"<userId>"}'
  */
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /*
  Example:
  curl {{local_url}}/products
  */
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  /*
  Example:
  curl {{local_url}}/products/user/<userId>
  */
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.productsService.findByUser(userId);
  }

  /*
  Example:
  curl {{local_url}}/products/<productId>
  */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /*
  Example:
  curl -X PATCH {{local_url}}/products/<productId> \
    -H "Content-Type: application/json" \
    -d '{"price":49.99,"isActive":false}'
  */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  /*
  Example:
  curl -X DELETE {{local_url}}/products/<productId>
  */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
