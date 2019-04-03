import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { Mutation, Query, Resolver, Args, Context } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from '../gql-authguard.decorator';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { User } from './user.entity';

@Resolver('User')
export class UsersResolvers {
  constructor(private authService: AuthService, private usersService: UsersService) {}

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
    password = await bcrypt.hash(password, 10);
    let user = await User.create({ email, name, password });

    const ipAddress = await this.usersService.getIpAddress(req);
    user.location = await this.usersService.geoIpAddress(ipAddress);

    user = await user.save();

    return {
      token: this.authService.getToken(user),
      user
    };
  }
}
