import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { TrailsModule } from './trails/trails.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { RidesModule } from './rides/rides.module';
import { DateScalar } from './common/scalars/date.scalar';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './redis/redis.service';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    GraphQLModule.forRoot({
      context: ({ req }) => ({ req }),
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.schema.ts'),
        outputAs: 'class'
      },
      resolvers: { Date: DateScalar }
    }),
    UsersModule,
    TrailsModule,
    AuthModule,
    RidesModule,
    RedisModule,
    CommentsModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, RedisService]
})
export class AppModule {}
