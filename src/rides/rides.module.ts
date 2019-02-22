import { Module } from '@nestjs/common';
import { RidesResolvers } from './rides.resolvers';
import { RidesService } from './rides.service';
import { TrailsModule } from 'src/trails/trails.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './ride.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ride]), TrailsModule],
  providers: [RidesResolvers, RidesService]
})
export class RidesModule {}
