import { Query, Resolver, Args } from '@nestjs/graphql';
import { TrailsService } from './trails.service';

@Resolver()
export class TrailsResolvers {
  constructor(private trailsService: TrailsService) {}

  @Query('trails')
  async getTrails(@Args('location') location: string) {
    return this.trailsService.getByLocation(location);
  }
}
