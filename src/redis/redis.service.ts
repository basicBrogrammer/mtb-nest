import { Injectable, Logger } from '@nestjs/common';
import * as redis from 'redis';
import { promisify } from 'util';
const hours = 60 * 60;
const TTL = hours * 24;

@Injectable()
export class RedisService {
  public redisClient: any;
  private getAsync: any; // Promisify redis.get
  constructor() {
    this.redisClient = redis.createClient({ host: process.env.REDIS_HOST });
    // listen for redis connection error event
    this.redisClient.on('error', (error) => {
      // handle error here
      Logger.error(`Redis has errored: ${error}`);
    });
    this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
  }

  public async getObject(key: string) {
    const result = await this.get(key);
    return JSON.parse(result);
  }

  public get(key: string) {
    return this.getAsync(key);
  }

  public set(key: string, value: any, ttl: number = TTL): Promise<any> {
    if (typeof value === 'object') {
      return this.redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    } else {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
  }

  public async wrap(
    key: string,
    callback: Promise<any>,
    isObject: boolean = false,
    ttl: number = TTL
  ): Promise<any> {
    Logger.log('calling wrap...');

    const currentValue = isObject ? await this.getObject(key) : await this.get(key);
    if (currentValue) {
      Logger.log('currentValue present....');
      return currentValue;
    }

    Logger.log('querying for a new value......');
    const newValue = await callback;

    this.set(key, newValue, ttl);
    return newValue;
  }
}
