import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/,
  })
  email: string;

  @Prop({
    trim: true,
  })
  username?: string;

  @Prop({
    required: true,
  })
  passwordHash: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({
    type: [String],
    default: [],
  })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
