import { PipeTransform, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export class ParseObjectPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ObjectId: ${value}`);
    }
    return new Types.ObjectId(value);
  }
}
