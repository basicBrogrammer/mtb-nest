import { Query, Resolver, Args, Context } from '@nestjs/graphql';
import { TrailsService } from './trails.service';
import { Logger } from '@nestjs/common';

@Resolver()
export class TrailsResolvers {
  constructor(private trailsService: TrailsService) {}

  @Query('trails')
  async getTrails(@Context('req') req: any, @Args('location') location: string) {
    Logger.log(`Let's see what the ip is ${req.ip}`);

    return this.trailsService.getByLocation(location);
  }
}
