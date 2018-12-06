import { Query, Mutation, Resolver, Context, Args, ResolveProperty, Parent } from '@nestjs/graphql';
import { Ride } from './ride.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/gql-authguard.decorator';
import { RidesService } from './rides.service';
import { TrailsService } from 'src/trails/trails.service';

@Resolver('Ride')
export class RidesResolvers {
  constructor(private ridesService: RidesService, private trailService: TrailsService) {}
  @Query('rides')
  async getRides(): Promise<Ride[]> {
    console.log('Get rides is firing......');
    return Ride.find();
  }

  @Query('ride')
  async getRide(@Args('id') id: number): Promise<Ride> {
    return Ride.findOne(id);
  }

  @ResolveProperty('trail')
  // TODO: return type?
  async getTrail(@Parent() ride) {
    const { trailId } = ride;
    return await this.trailService.getById(trailId);
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async saveRide(
    @Context('req') req: any,
    @Args('id') id: string,
    @Args('trailId') trailId: string,
    @Args('date') date: Date,
    @Args('time') time: Date
  ): Promise<Ride> {
    return id
      ? Ride.findOne(id) // TODO: handle update case
      : this.ridesService.createRide({
          trailId,
          date: new Date(date),
          time: new Date(time),
          user: req.user
        });
  }
}
