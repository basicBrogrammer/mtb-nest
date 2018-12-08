import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Participation } from './participation.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class ParticipationService {
  async create(rideId: number, userId: number): Promise<boolean> {
    try {
      await Participation.create({ rideId, userId }).save();
      return true;
    } catch (error) {
      Logger.log(error);
      return false;
    }
  }

  async accept(participationId: number, owner: User): Promise<boolean> {
    const part = await Participation.findOne(participationId, { relations: ['ride'] });
    // TODO: do i have to check the id?
    if (owner.id !== part.ride.user.id) {
      throw new UnauthorizedException();
    }

    part.status_enum = 1;
    await part.save();
    return part.status() === 'accepted';
  }

  async reject(participationId: number, owner: User): Promise<boolean> {
    const part = await Participation.findOne(participationId, { relations: ['ride'] });
    // TODO: do i have to check the id?
    if (owner.id !== part.ride.user.id) {
      throw new UnauthorizedException();
    }

    part.status_enum = 2;
    await part.save();

    return part.status() === 'rejected';
  }
}
