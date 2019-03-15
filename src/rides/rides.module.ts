import { Module } from '@nestjs/common';
import { RidesResolvers } from './rides.resolvers';
import { RidesService } from './rides.service';
import { TrailsModule } from 'src/trails/trails.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ride } from './ride.entity';
import { GeocodeModule } from 'src/geocode/geocode.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ride]), TrailsModule, GeocodeModule],
  providers: [RidesResolvers, RidesService]
})
export class RidesModule {}
