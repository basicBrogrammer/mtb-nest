import { Injectable } from '@nestjs/common';
import { TrailsService } from 'src/trails/trails.service';
import { User } from 'src/users/user.entity';
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
}
