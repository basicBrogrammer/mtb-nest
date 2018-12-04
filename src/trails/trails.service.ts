import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { RedisService } from 'src/redis/redis.service';
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY,
  Promise
});
const mtbProjectBaseUrl = 'https://www.mtbproject.com/data';
const mtbProjectApiKey = process.env.MTB_PROJECT_KEY;

@Injectable()
export class TrailsService {
  constructor(private redis: RedisService) {}
  async getByLocation(location: string) {
    const response = await this.redis.wrap(
      `geocode-${location.toLowerCase().replace(/\W/g, '-')}`,
      this.requestGeocode(location),
      true
    );
    const { lat, lng } = response.json.results[0].geometry.location;

    // Fetch the MTB Project rides
    return this.redis.wrap(
      `get-trails-${lat}-${lng}`,
      this.requestTrailByLatAndLng(lat, lng),
      true
    );
  }

  // return value of trail interface?
  async getById(id: string) {
    return this.redis.wrap(`get-trails-by-id-${id}`, this.requestTrailById(id), true);
  }

  private requestGeocode(location: string): Promise<any> {
    return googleMapsClient
      .geocode({
        address: location
      })
      .asPromise();
  }

  private requestTrailByLatAndLng(lat: number, lng: number): Promise<any> {
    return fetch(
      `${mtbProjectBaseUrl}/get-trails?lat=${lat}&lon=${lng}&maxDistance=50&sort=distance&key=${mtbProjectApiKey}`
    )
      .then((res) => res.json())
      .then((json) => json.trails);
  }

  private requestTrailById(id: string): Promise<any> {
    return fetch(`${mtbProjectBaseUrl}/get-trails-by-id?ids=${id}&key=${mtbProjectApiKey}`)
      .then((res) => res.json())
      .then((json) => json.trails[0]);
  }
}
