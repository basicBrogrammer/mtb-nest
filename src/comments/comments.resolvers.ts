import { Resolver, Args, Context, Query, Mutation, Subscription } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/gql-authguard.decorator';
import { UseGuards } from '@nestjs/common';
import { Comment } from './comment.entity';
import { Ride } from 'src/rides/ride.entity';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubSub = new PubSub();

@Resolver('Comment')
export class CommentsResolver {
  @Query('comments')
  @UseGuards(GqlAuthGuard)
  async getComments(@Args('rideId') rideId: number): Promise<Comment[]> {
    return Comment.find({ where: { rideId } });
  }

  @Mutation('saveComment')
  @UseGuards(GqlAuthGuard)
  async saveComment(
    @Context('req') req: any,
    @Args('body') body: string,
    @Args('rideId') rideId: number
  ): Promise<Comment> {
    const ride = await Ride.findOne(rideId);
    const comment = Comment.create({ ride, body, user: req.user }).save();
    pubSub.publish('commentAdded', { commentAdded: comment });
    return comment;
  }

  @Mutation('deleteComment')
  @UseGuards(GqlAuthGuard)
  async deleteComment(@Context('req') req: any, @Args('id') id: number): Promise<boolean> {
    try {
      const comment = await Comment.findOne({ where: { id, userId: req.user.id } });
      comment.remove();
      return true;
    } catch (error) {
      return false;
    }
  }

  // TODO: add GqlAuthGuard
  @Subscription()
  commentAdded() {
    return {
      subscribe: withFilter(
        () => pubSub.asyncIterator('commentAdded'),
        async (root, args, ctx, info) => {
          const comment = await root.commentAdded;

          return args.rideId === comment.rideId;
        }
      )
    };
  }
}
