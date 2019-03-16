import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TrailsService } from 'src/trails/trails.service';
import { Ride } from './ride.entity';
import { CreateRide } from './dto/create-rides.dto';
import { User } from 'src/users/user.entity';
import { Participation } from 'src/participation/participation.entity';
import { In, Repository, MoreThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GeocodeService } from 'src/geocode/geocode.service';

@Injectable()
export class RidesService {
  perPage: number;
  constructor(
    @InjectRepository(Ride) private readonly rideRepo: Repository<Ride>,
    private trailsService: TrailsService,
    private geocode: GeocodeService
  ) {
    this.perPage = 25;
  }

  async getRides(page: number, location?: string): Promise<Ride[]> {
    const skip = (page - 1) * this.perPage;
    let sql = 'ride.date >= :today';
    let parameters: any = { today: new Date() };

    if (location && location.length > 0) {
      const { lat, lng } = await this.geocode.getLatAndLong(location);
      sql += ' and ST_DWithin(ride.location, ST_MakePoint(:lat, :lng)::geography, 100000)';
      parameters = { ...parameters, lng, lat };
    }

    return this.rideRepo
      .createQueryBuilder('ride')
      .where(sql)
      .setParameters(parameters)
      .skip(skip)
      .take(this.perPage)
      .getMany();
  }

  async getRidesForUser(user: User): Promise<Ride[]> {
    return this.rideRepo.find({ where: { user, date: MoreThanOrEqual(new Date()) } });
  }

  async getParticipatingRidesForUser(user: User): Promise<Ride[]> {
    const parts = await Participation.find({ status_enum: 1, user });
    if (parts.length === 0) return [];

    const rideIds = parts.map((part) => part.rideId);

    return this.rideRepo.find({ where: { id: In(rideIds), date: MoreThanOrEqual(new Date()) } });
  }

  async createRide(rideData: CreateRide): Promise<Ride> {
    const ride = this.rideRepo.create(rideData);
    const trail = await this.trailsService.getById(rideData.trailId);

    const { lat, lng } = await this.geocode.getLatAndLong(trail.location);
    ride.location = {
      type: 'Point',
      coordinates: [lat, lng]
    };
    return ride.save();
  }

  async updateRide(id: number, rideData: CreateRide): Promise<Ride> {
    const ride = await this.rideRepo.findOne(id);
    const owner = await ride.user;

    if (owner.id !== rideData.user.id) {
      throw new UnauthorizedException();
    }

    const time = rideData.time.toISOString().split('T')[1];
    const trail = await this.trailsService.getById(rideData.trailId);
    const { lat, lng } = await this.geocode.getLatAndLong(trail.location);
    const location = {
      type: 'Point',
      coordinates: [lat, lng]
    };
    await this.rideRepo.update(id, { ...rideData, location, time });

    return this.rideRepo.findOne(id);
  }
}
