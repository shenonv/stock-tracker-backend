import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, password, name } = createUserDto;
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) throw new ConflictException('Email already registered');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const created = new this.userModel({ email, passwordHash, name });
    const saved = await created.save();
    return saved.toJSON(); // passwordHash removed in toJSON
  }
}
