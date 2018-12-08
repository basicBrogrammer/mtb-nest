import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { Participation } from './participation.entity';
import { UseGuards, Logger } from '@nestjs/common';
import { GqlAuthGuard } from 'src/gql-authguard.decorator';
import { ParticipationService } from './participation.service';

@Resolver('participations')
export class ParticipationsResolvers {
  constructor(private participationService: ParticipationService) {}
  @Query('participations')
  async getParticipations(): Promise<Participation[]> {
    Logger.log('getParticipation firing....');
    return Participation.find({ relations: ['ride', 'user'] });
  }

  @Mutation('requestParticipation')
  @UseGuards(GqlAuthGuard)
  async requestParticipation(
    @Context('req') req: any,
    @Args('rideId') rideId: number
  ): Promise<boolean> {
    return this.participationService.create(rideId, req.user.id);
  }

  @Mutation('acceptParticipant')
  @UseGuards(GqlAuthGuard)
  async acceptParticipant(@Context('req') req: any, @Args('id') id: number): Promise<boolean> {
    return this.participationService.accept(id, req.user);
  }

  @Mutation('rejectParticipant')
  @UseGuards(GqlAuthGuard)
  async rejectParticipant(@Context('req') req: any, @Args('id') id: number): Promise<boolean> {
    return this.participationService.reject(id, req.user);
  }
}
