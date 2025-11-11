import { Controller, Get, Param } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseObjectPipe } from '../common/pipes/parse-object-id.pipe';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  /*
  Example:
  curl {{local_url}}/catalogs
  */
  @Get()
  findAll() {
    return this.catalogsService.findAll();
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
