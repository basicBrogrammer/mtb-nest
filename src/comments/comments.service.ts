import { Injectable, Logger } from '@nestjs/common';
import { Comment } from './comment.entity';
import { CreateComment } from './dto/create-comment.dto';
import { PubsubService } from 'src/pubsub/pubsub.service';
import { Ride } from 'src/rides/ride.entity';
import { User } from 'src/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Notification } from "src/notifications/notification.entity";

@Injectable()
export class CommentsService {
  commentAddedTrigger: string = 'commentAdded';

  constructor(
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    private pubSubService: PubsubService
  ) {}

  public async findByRideId(rideId: number): Promise<Comment[]> {
    return Comment.find({ where: { rideId } });
  }

  public async create(commentData: CreateComment): Promise<Comment> {
    const ride = await Ride.findOne(commentData.rideId);
    const comment = Comment.create({ ...commentData, ride }).save();
    this.pubSubService.publish('commentAdded', { commentAdded: comment });
    // this.notificationService.create({type: 'comment', entry: comment})
    return comment;
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
