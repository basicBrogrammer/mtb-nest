import { Injectable, Logger } from '@nestjs/common';
import { Comment } from './comment.entity';
import { CreateComment } from './dto/create-comment.dto';
import { PubsubService } from '../pubsub/pubsub.service';
import { Ride } from '../rides/ride.entity';
import { User } from '../users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  commentAddedTrigger: string = 'commentAdded';

  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    private notificationService: NotificationsService,
    private pubSubService: PubsubService
  ) {}

  public async findByRideId(rideId: number): Promise<Comment[]> {
    return Comment.find({ where: { rideId } });
  }

  public async create(commentData: CreateComment): Promise<Comment> {
    const ride = await Ride.findOne(commentData.rideId);
    return Comment.create({ ...commentData, ride })
      .save()
      .then(async (comment) => {
        this.pubSubService.publish('commentAdded', { commentAdded: comment });
        this.notificationService.commentCreated(comment);

        return comment;
      });
  }

  public async deleteForUser(user: User, id: number): Promise<boolean> {
    try {
      const comment = await Comment.findOne({ where: { id, userId: user.id } });
      return comment.remove().then(() => true);
    } catch (error) {
      return false;
    }
  }
}
