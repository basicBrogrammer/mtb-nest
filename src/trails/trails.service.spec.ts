import { Test, TestingModule } from '@nestjs/testing';
import { TrailsService } from './trails.service';
import { RedisModule } from 'src/redis/redis.module';

describe('TrailsService', () => {
  let service: TrailsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [TrailsService]
    }).compile();
    service = module.get<TrailsService>(TrailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('#getByLocation will return trails near a location', async () => {
    const trails = await service.getByLocation('Asheville, NC');
    expect(trails.length).toBe(10);

    const locations = trails.map((trail) => trail.location);
    const expectedLocations = [
      'Bent Creek, North Carolina',
      'Black Mountain, North Carolina',
      'Avery Creek, North Carolina'
    ];
    expect(Array.from(new Set(locations))).toEqual(expect.arrayContaining(expectedLocations));
  });

  it('#getById returns a single trail', async () => {
    const id = 5343103;
    const trail = await service.getById(id.toString());

    expect(trail.id).toEqual(id);
    expect(trail.name).toEqual('Best of DuPont');
  });
});
