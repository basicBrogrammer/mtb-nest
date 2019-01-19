import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class PubsubService {
  private pubSub: PubSub;
  constructor() {
    this.pubSub = new PubSub();
  }

  public async publish(name: string, payload: any): Promise<void> {
    this.pubSub.publish(name, payload);
  }

  public subscribe(trigger: string): any {
    return this.pubSub.asyncIterator(trigger);
  }
}
