import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY,
  Promise
});

@Injectable()
export class GeocodeService {
  constructor(private redis: RedisService) {}

  async getLatAndLong(location: string): Promise<any> {
    const response = await this.getCoordinates(location);

    return response.json.results[0].geometry.location;
  }
  async getCoordinates(location: string): Promise<any> {
    return this.redis.wrap(
      `geocode-${location.toLowerCase().replace(/\W/g, '-')}`,
      googleMapsClient
        .geocode({
          address: location
        })
        .asPromise(),
      true
    );
  }
}
