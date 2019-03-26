import { Module } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { TrailsResolvers } from './trails.resolvers';
import { RedisModule } from '../redis/redis.module';
import { GeocodeModule } from '../geocode/geocode.module';

@Module({
  imports: [RedisModule, GeocodeModule],
  providers: [TrailsService, TrailsResolvers],
  exports: [TrailsService]
})
export class TrailsModule {}
