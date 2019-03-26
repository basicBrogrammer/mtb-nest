import { Resolver, Args, Context, Query, Mutation, Subscription } from '@nestjs/graphql';
import { GqlAuthGuard } from '../gql-authguard.decorator';
import { UseGuards } from '@nestjs/common';
import { Comment } from './comment.entity';
import { Ride } from '../rides/ride.entity';
import { withFilter } from 'graphql-subscriptions';
import { PubsubService } from '../pubsub/pubsub.service';
import { CommentsService } from './comments.service';

@Resolver('Comment')
export class CommentsResolver {
  constructor(private pubSubService: PubsubService, private commentsService: CommentsService) {}

  @Query('comments')
  @UseGuards(GqlAuthGuard)
  async getComments(@Args('rideId') rideId: number): Promise<Comment[]> {
    return this.commentsService.findByRideId(rideId);
  }

  @Mutation('saveComment')
  @UseGuards(GqlAuthGuard)
  async saveComment(
    @Context('req') req: any,
    @Args('body') body: string,
    @Args('rideId') rideId: number
  ): Promise<Comment> {
    return this.commentsService.create({ rideId, body, user: req.user });
  }

  @Mutation('deleteComment')
  @UseGuards(GqlAuthGuard)
  async deleteComment(@Context('req') req: any, @Args('id') id: number): Promise<boolean> {
    return this.commentsService.deleteForUser(req.user, id);
  }

  // TODO: add GqlAuthGuard
  @Subscription()
  commentAdded() {
    return {
      subscribe: withFilter(
        () => this.pubSubService.subscribe(this.commentsService.commentAddedTrigger),
        async (root, args, ctx, info) => {
          const comment = await root.commentAdded;

          return args.rideId === comment.rideId;
        }
      )
    };
  }
}
