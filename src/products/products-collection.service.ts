import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

const PRODUCT_COLLECTION_VALIDATOR = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'price', 'category', 'createdAt', 'userId'],
    properties: {
      name: { bsonType: 'string' },
      description: { bsonType: 'string' },
      price: {
        bsonType: ['double', 'int', 'long'],
        minimum: 0,
      },
      stock: {
        bsonType: ['int', 'long'],
        minimum: 0,
      },
      category: { bsonType: 'string' },
      images: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['url'],
          properties: {
            url: { bsonType: 'string' },
            metadata: {},
          },
        },
      },
      tags: { bsonType: 'array', items: { bsonType: 'string' } },
      userId: { bsonType: 'objectId' },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
      isActive: { bsonType: 'bool' },
    },
  },
};

@Injectable()
export class ProductsCollectionService implements OnModuleInit {
  private readonly logger = new Logger(ProductsCollectionService.name);

  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.waitForConnection();
      const db = this.connection.db;

      if (!db) {
        this.logger.warn(
          'MongoDB connection is not ready; skip validator setup',
        );
        return;
      }

      const collections = await db
        .listCollections({ name: 'products' })
        .toArray();

      if (!collections.length) {
        await db.createCollection('products', {
          validator: PRODUCT_COLLECTION_VALIDATOR,
        });
        this.logger.log('Created products collection with validator');
      } else {
        await db.command({
          collMod: 'products',
          validator: PRODUCT_COLLECTION_VALIDATOR,
          validationLevel: 'strict',
        });
        this.logger.log('Updated products collection validator');
      }
    } catch (error) {
      this.logger.error(
        'Failed to ensure products collection validator',
        error as Error,
      );
    }
  }

  private async waitForConnection(): Promise<void> {
    if (this.connection.readyState === 1) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        this.connection.off('connected', onConnected);
        this.connection.off('error', onError);
      };

      const onConnected = () => {
        cleanup();
        resolve();
      };

      const onError = (error: unknown) => {
        cleanup();
        reject(error);
      };

      this.connection.once('connected', onConnected);
      this.connection.once('error', onError);
    });
  }
}
