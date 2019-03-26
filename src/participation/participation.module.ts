import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationsResolvers } from './participations.resolvers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './participation.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Participation]), NotificationsModule],
  providers: [ParticipationService, ParticipationsResolvers]
})
export class ParticipationModule {}
