import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
const googleMapsClient = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_KEY,
  Promise,
});
const mtbProjectBaseUrl = 'https://www.mtbproject.com/data';
const mtbProjectApiKey = process.env.MTB_PROJECT_KEY;

@Injectable()
export class TrailsService {
  async getByLocation(location: string) {
    // CACHE THIS!!!
    // Geocode the location string
    const response = await googleMapsClient
      .geocode({
        address: location,
      })
      .asPromise();
    const { lat, lng } = response.json.results[0].geometry.location;

    // Fetch the MTB Project rides
    const json = await fetch(
      `${mtbProjectBaseUrl}/get-trails?lat=${lat}&lon=${lng}&maxDistance=50&sort=distance&key=${mtbProjectApiKey}`,
    ).then(res => res.json());
    return json.trails;
  }
}
