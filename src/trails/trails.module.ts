import { Module } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { TrailsResolvers } from './trails.resolvers';

@Module({
  providers: [TrailsService, TrailsResolvers],
})
export class TrailsModule {}
