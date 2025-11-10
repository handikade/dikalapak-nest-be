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
    const messages = Object.values(error.errors)
      .map((err) => err.message)
      .filter(Boolean);

    throw new BadRequestException(messages.length ? messages : error.message);
  }

  if (error instanceof MongoServerError && error.code === 121) {
    const details = extractSchemaErrors(error.errInfo?.details);
    throw new BadRequestException(details ?? 'Document failed validation');
  }

  if (error instanceof MongooseMongo.MongoServerError && error.code === 121) {
    const details = extractSchemaErrors(
      (error as MongoServerError).errInfo?.details,
    );
    throw new BadRequestException(details ?? 'Document failed validation');
  }

  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }

  throw new InternalServerErrorException(
    `Failed to ${action} ${resourceLabel}`,
  );
}
