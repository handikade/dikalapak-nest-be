import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError, mongo as MongooseMongo } from 'mongoose';
import { extractSchemaErrors } from './extract-schema-errors.util';

export function handleValidationError(
  error: unknown,
  action: string,
  resourceLabel = 'resource',
): never {
  if (error instanceof MongooseError.ValidationError) {
    console.log('I');
    const messages = Object.values(error.errors)
      .map((err) => err.message)
      .filter(Boolean);

    throw new BadRequestException(messages.length ? messages : error.message);
  }

  if (error instanceof MongoServerError && error.code === 121) {
    console.log('II');
    const details = extractSchemaErrors(error.errInfo?.details);
    throw new BadRequestException(details ?? 'Document failed validation');
  }

  if (error instanceof MongooseMongo.MongoServerError && error.code === 121) {
    console.log('III');
    const details = extractSchemaErrors(
      (error as MongoServerError).errInfo?.details,
    );
    throw new BadRequestException(details ?? 'Document failed validation');
  }

  if (error instanceof Error) {
    console.log('IV');
    throw new InternalServerErrorException(error.message);
  }

  throw new InternalServerErrorException(
    `Failed to ${action} ${resourceLabel}`,
  );
}
