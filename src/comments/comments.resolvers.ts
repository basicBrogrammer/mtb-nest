import { Resolver, Args, Context, Query, Mutation } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/gql-authguard.decorator';
import { UseGuards } from '@nestjs/common';
import { Comment } from './comment.entity';
import { Ride } from 'src/rides/ride.entity';

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
    return Comment.create({ ride, body, user: req.user }).save();
  }

  @Mutation('deleteComment')
  @UseGuards(GqlAuthGuard)
  async deleteComment(@Context('req') req: any, @Args('id') id: number): Promise<boolean> {
    const comment = await Comment.findOne({ where: { id, userId: req.user.id } });
    try {
      comment.remove();
      return true;
    } catch (error) {
      return false;
    }
  }
}
