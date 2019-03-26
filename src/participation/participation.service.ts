import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Participation } from './participation.entity';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation) private readonly participationRepo: Repository<Participation>,
    private notificationsService: NotificationsService
  ) {}

  async create(rideId: number, userId: number): Promise<boolean> {
    return this.participationRepo
      .create({ rideId, userId })
      .save()
      .then(
        async (participation) => {
          this.notificationsService.participationCreated(participation);
          return true;
        },
        (error) => {
          Logger.log(error);
          return false;
        }
      );
  }

  async accept(participationId: number, owner: User): Promise<boolean> {
    const part = await Participation.findOne(participationId, { relations: ['ride'] });
    // TODO: do i have to check the id?
    if (owner.id !== part.ride.user.id) {
      throw new UnauthorizedException();
    }

    part.status_enum = 1;
    return part.save().then(
      (participation) => {
        this.notificationsService.participationAccepted(participation);
        return participation.status() === 'accepted';
      },
      (error) => {
        Logger.log(error);
        return false;
      }
    );
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
