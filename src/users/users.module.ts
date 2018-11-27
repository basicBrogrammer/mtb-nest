import { Module } from '@nestjs/common';
import { UsersResolvers } from './users.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  providers: [UsersResolvers, AuthService]
})
export class UsersModule {}
