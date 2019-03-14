import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TrailsService } from 'src/trails/trails.service';
import { Ride } from './ride.entity';
import { CreateRide } from './dto/create-rides.dto';
import { User } from 'src/users/user.entity';
import { Participation } from 'src/participation/participation.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RidesService {
  perPage: number;
  constructor(
    @InjectRepository(Ride) private readonly rideRepo: Repository<Ride>,
    private trailsService: TrailsService
  ) {
    this.perPage = 25;
  }

  async getRides(page: number): Promise<Ride[]> {
    const skip = (page - 1) * this.perPage;
    return this.rideRepo.find({ take: this.perPage, skip });
  }

  async getRidesForUser(user: User): Promise<Ride[]> {
    return user.rides;
  }

  async getParticipatingRidesForUser(user: User): Promise<Ride[]> {
    const parts = await Participation.find({ status_enum: 1, user });
    if (parts.length === 0) return [];

    const rideIds = parts.map((part) => part.rideId);

    return this.rideRepo.find({ where: { id: In(rideIds) } });
  }

  async createRide(rideData: CreateRide): Promise<Ride> {
    const ride = this.rideRepo.create({
      ...rideData,
      time: rideData.time.toISOString()
    });
    const trail = await this.trailsService.getById(rideData.trailId);
    ride.location = {
      type: 'Point',
      coordinates: [35.5951, 82.5515]
    };
    return ride.save();
  }

  async updateRide(id: number, rideData: CreateRide): Promise<Ride> {
    const ride = await this.rideRepo.findOne(id);
    const owner = await ride.user;
    if (owner.id !== rideData.user.id) {
      throw new UnauthorizedException();
    }
    const trail = await this.trailsService.getById(rideData.trailId);

    ride.trailId = rideData.trailId;
    ride.date = rideData.date;
    ride.time = rideData.time;
    ride.location = {
      type: 'Point',
      coordinates: [35.5951, 82.5515]
    };

    return ride.save();
  }
}
