import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Mutation, Query, Resolver, Args, Context } from '@nestjs/graphql';
import { User } from './user.entity';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from 'src/gql-authguard.decorator';
import { AuthService } from 'src/auth/auth.service';

@Resolver('User')
export class UsersResolvers {
  constructor(private authService: AuthService) {}
  @Query('users')
  @UseGuards(GqlAuthGuard)
  async getUsers() {
    // what type should req be ???
    return User.find();
  }

  @Mutation()
  async login(@Args('email') email: string, @Args('password') password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`No such user found for email: ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('Invalid password');
    }

    return {
      token: this.authService.getToken(user),
      user
    };
  }

  @Mutation()
  async signup(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('name') name: string,
    @Context('req') req: any
  ) {
    Logger.log(`Let's see what the ip is ${req.ip}`);

    Logger.log(`Let's see what the ip is ${req.connection.remoteAddress}`);
    password = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, password }).save();

    return {
      token: this.authService.getToken(user),
      user
    };
  }
}
