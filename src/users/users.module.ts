import { Module } from '@nestjs/common';
import { UsersResolvers } from './users.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  providers: [UsersResolvers, AuthService]
})
export class UsersModule {}
