import { Module } from '@nestjs/common';
import { RidesResolvers } from './rides.resolvers';
import { TrailsService } from 'src/trails/trails.service';
import { RidesService } from './rides.service';

@Module({
  providers: [RidesResolvers, TrailsService, RidesService]
})
export class RidesModule {}
