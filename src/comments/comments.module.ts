import { Module } from '@nestjs/common';
import { CommentsResolver } from './comments.resolvers';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), PubsubModule],
  providers: [CommentsResolver, CommentsService]
})
export class CommentsModule {}
