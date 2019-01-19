import { Module } from '@nestjs/common';
import { CommentsResolver } from './comments.resolvers';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { CommentsService } from './comments.service';

@Module({ imports: [PubsubModule], providers: [CommentsResolver, CommentsService] })
export class CommentsModule {}
