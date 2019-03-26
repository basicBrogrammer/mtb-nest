import { Module } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [GeocodeService],
  exports: [GeocodeService]
})
export class GeocodeModule {}
