import { Module } from '@nestjs/common';
import { CommentsResolver } from './comments.resolvers';

@Module({ providers: [CommentsResolver] })
export class CommentsModule {}
