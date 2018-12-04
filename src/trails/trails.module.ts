import { Module } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { TrailsResolvers } from './trails.resolvers';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [TrailsService, TrailsResolvers],
  exports: [TrailsService]
})
export class TrailsModule {}
