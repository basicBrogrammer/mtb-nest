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
  async getRides(@Args('page') page: number): Promise<Ride[]> {
    return this.ridesService.getRides(page);
  }

  @Query('ride')
  async getRide(@Args('id') id: number): Promise<Ride> {
    return Ride.findOne(id);
  }

  @Query('myRides')
  @UseGuards(GqlAuthGuard)
  async myRides(@Context('req') req: any): Promise<Ride[]> {
    return this.ridesService.getRidesForUser(req.user);
  }

  @Query('myParticipatingRides')
  @UseGuards(GqlAuthGuard)
  async myParticipatingRides(@Context('req') req: any): Promise<Ride[]> {
    return this.ridesService.getParticipatingRidesForUser(req.user);
  }

  @ResolveProperty('trail')
  // TODO: return type?
  async getTrail(@Parent() ride) {
    const { trailId } = ride;
    return await this.trailService.getById(trailId);
  }

  @Mutation('saveRide')
  @UseGuards(GqlAuthGuard)
  async saveRide(
    @Context('req') req: any,
    @Args('id') id: number,
    @Args('trailId') trailId: string,
    @Args('date') date: Date,
    @Args('time') time: Date
  ): Promise<Ride> {
    const rideData = {
      trailId,
      date: new Date(date),
      time: new Date(time),
      user: req.user
    };

    return id ? this.ridesService.updateRide(id, rideData) : this.ridesService.createRide(rideData);
  }

  @Mutation('deleteRide')
  @UseGuards(GqlAuthGuard)
  async deleteRide(@Context('req') req: any, @Args('id') id: number) {
    try {
      const ride = await Ride.findOne({ where: { id, userId: req.user.id } });
      ride.remove();
      return true;
    } catch (error) {
      return false;
    }
  }
}
