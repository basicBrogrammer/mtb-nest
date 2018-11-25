import { Module } from '@nestjs/common';
import { UsersResolvers } from './users.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersResolvers],
})
export class UsersModule {}
