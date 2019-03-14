import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { RedisService } from 'src/redis/redis.service';
import { GeocodeService } from 'src/geocode/geocode.service';
const mtbProjectBaseUrl = 'https://www.mtbproject.com/data';
const mtbProjectApiKey = process.env.MTB_PROJECT_KEY;

@Injectable()
export class TrailsService {
  constructor(private redis: RedisService, private geocode: GeocodeService) {}

  async getByLocation(location: string) {
    const { lat, lng } = await this.geocode.getLatAndLong(location);

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
