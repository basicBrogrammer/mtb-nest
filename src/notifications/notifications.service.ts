import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Repository } from 'typeorm';
import { Ride } from 'src/rides/ride.entity';
import { User } from 'src/users/user.entity';
import { Participation } from 'src/participation/participation.entity';
import { Comment } from 'src/comments/comment.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>
  ) {}

  async rideCreated(ride: Ride, actor: User): Promise<number> {
    return 1;
  }

  async markAsRead(user: User): Promise<any> {
    return this.notificationRepo.update({ user, read: false }, { read: true });
  }

  async notificationsForUser(user: User): Promise<Notification[]> {
    return this.notificationRepo.find({ where: { user } });
  }

  async participationCreated(participation: Participation): Promise<any> {
    // TODO: Why do i have to research it? Maybe change the param to the participationId
    participation = await Participation.findOne(participation.id, { relations: ['user', 'ride'] });
    const ride = participation.ride,
      actor = participation.user,
      rideOwner = await ride.user;
    return this.notificationRepo
      .create({
        actor,
        ride,
        user: rideOwner,
        body: `<b>${actor.name}</b> wants to join your ride.`
      })
      .save();
  }

  async participationAccepted(participation: Participation): Promise<any> {
    // TODO: Why do i have to research it? Maybe change the param to the participationId
    participation = await Participation.findOne(participation.id, { relations: ['user', 'ride'] });
    const ride = participation.ride,
      user = participation.user,
      rideOwner = await ride.user;

    return this.notificationRepo
      .create({
        actor: rideOwner,
        ride,
        user,
        body: `<b>${rideOwner.name}</b> added you to their ride.`
      })
      .save();
  }

  async commentCreated(comment: Comment): Promise<any> {
    const commenter = await comment.user;
    const ride = await comment.ride;
    const rideOwner = await ride.user;
    const participations = await Participation.find({
      relations: ['user'],
      where: { status_enum: 1, rideId: ride.id }
    });
    const participants = participations.map((participation) => participation.user);
    try {
      return Promise.all(
        [...participants, rideOwner].map((user) => {
          return this.notificationRepo
            .create({
              actor: commenter,
              ride,
              user,
              body: `<b>${commenter.name}</b> commented on your ride.`
            })
            .save();
        })
      );
    } catch {
      return false;
    }
  }
}
