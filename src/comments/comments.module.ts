import { Module } from '@nestjs/common';
import { CommentsResolver } from './comments.resolvers';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PubsubModule, NotificationsModule],
  providers: [CommentsResolver, CommentsService]
})
export class CommentsModule {}
