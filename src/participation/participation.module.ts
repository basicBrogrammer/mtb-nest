import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationsResolvers } from './participations.resolvers';

@Module({
  providers: [ParticipationService, ParticipationsResolvers]
})
export class ParticipationModule {}
