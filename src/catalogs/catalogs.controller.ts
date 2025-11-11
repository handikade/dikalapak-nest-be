import { Controller, Get, Param, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseObjectPipe } from '../common/pipes/parse-object-id.pipe';
import { CatalogsService } from './catalogs.service';
import { CatalogPaginationDto } from './dto/catalog-pagination.dto';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  /*
  Example:
  curl {{local_url}}/catalogs
  */
  @Get()
  findAll(@Query() pagination: CatalogPaginationDto) {
    return this.catalogsService.findAll(pagination);
  }

  /*
    Example:
    curl {{local_url}}/catalogs/<productId>
    */
  @Get(':id')
  findOne(@Param('id', ParseObjectPipe) id: Types.ObjectId) {
    return this.catalogsService.findById(id);
  }
}
