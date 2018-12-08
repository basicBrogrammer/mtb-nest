import { Injectable } from '@nestjs/common';
import { TrailsService } from 'src/trails/trails.service';
import { Ride } from './ride.entity';
import { CreateRide } from './dto/create-rides.dto';

@Injectable()
export class RidesService {
  constructor(private trailsService: TrailsService) {}

  async createRide(rideData: CreateRide): Promise<Ride> {
    const ride = Ride.create({
      ...rideData,
      time: rideData.time.toISOString()
    });
    const trail = await this.trailsService.getById(rideData.trailId);
    ride.location = trail.location;
    return ride.save();
  }

  async updateRide(id: number, rideData: CreateRide): Promise<Ride> {
    const ride = await Ride.findOne(id);
    const trail = await this.trailsService.getById(rideData.trailId);

    ride.trailId = rideData.trailId;
    ride.date = rideData.date;
    ride.time = rideData.time;
    ride.location = trail.location;

    return ride.save();
  }
}
