import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
}

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /*
  Example:
  curl -X POST {{local_url}}/products \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <token>" \
    -d '{"name":"Desk Lamp","price":45.5,"category":"lighting"}'
  */
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.create(req.user.userId, createProductDto);
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
  curl {{local_url}}/products/me \
    -H "Authorization: Bearer <token>"
  */
  @Get('me')
  findMine(@Req() req: AuthenticatedRequest) {
    return this.productsService.findByUser(req.user.userId);
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
