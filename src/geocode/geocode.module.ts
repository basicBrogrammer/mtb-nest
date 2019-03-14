import { Module } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [GeocodeService],
  exports: [GeocodeService]
})
export class GeocodeModule {}
