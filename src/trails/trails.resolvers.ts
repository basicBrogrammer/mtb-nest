import { Query, Resolver, Args, Context } from '@nestjs/graphql';
import { TrailsService } from './trails.service';
import { Logger } from '@nestjs/common';

@Resolver()
export class TrailsResolvers {
  constructor(private trailsService: TrailsService) {}

  @Query('trails')
  async getTrails(@Args('location') location: string) {
    return this.trailsService.getByLocation(location);
  }
}
