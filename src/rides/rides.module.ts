import { Module } from '@nestjs/common';
import { RidesResolvers } from './rides.resolvers';
import { RidesService } from './rides.service';
import { TrailsModule } from 'src/trails/trails.module';

@Module({
  imports: [TrailsModule],
  providers: [RidesResolvers, RidesService]
})
export class RidesModule {}
