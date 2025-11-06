import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          throw new Error('Missing MONGODB_URI environment variable');
        }

        return {
          uri,
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  onModuleInit(): void {
    const connection = mongoose.connection;

    connection.on('connected', () => {
      this.logger.log('Connected to MongoDB');
    });

    connection.on('disconnected', () => {
      this.logger.warn('Disconnected from MongoDB');
    });

    connection.on('error', (error) => {
      this.logger.error('MongoDB connection error', error);
    });
  }
}
