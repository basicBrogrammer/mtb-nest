import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationsResolvers } from './participations.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participation])],
  providers: [ParticipationService, ParticipationsResolvers]
})
export class ParticipationModule {}
