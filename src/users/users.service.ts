import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { password, ...rest } = createUserDto;

    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const passwordHash = await bcrypt.hash(password, salt);

      const createdUser = new this.userModel({
        ...rest,
        passwordHash,
        createdAt: new Date(),
      });

      return createdUser.save();
    } catch (error: unknown) {
      // ✅ Proper narrowing to satisfy @typescript-eslint/no-unsafe-*
      if (error instanceof Error) {
        // Optionally log err.stack here
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const { password, ...rest } = updateUserDto;
    const updateData: Partial<User> = {
      ...rest,
      updatedAt: new Date(),
    };

    if (password) {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const passwordHash: string = await bcrypt.hash(password, salt);
      updateData.passwordHash = passwordHash;
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
