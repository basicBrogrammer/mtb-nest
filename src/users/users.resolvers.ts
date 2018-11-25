import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Mutation, Query, Resolver, Args } from '@nestjs/graphql';
import { User } from './user.entity';

@Resolver('User')
export class UsersResolvers {
  @Query('users')
  async getUsers() {
    return User.find();
  }

  @Mutation()
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    };
  }

  @Mutation()
  async signup(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
  ) {
    password = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password }).save();

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    };
  }
}
