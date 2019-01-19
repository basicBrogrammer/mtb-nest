import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationService } from './participation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { ParticipationModule } from './participation.module';
import { Ride } from 'src/rides/ride.entity';
import { getRepository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Participation } from './participation.entity';
const defaultDBConfig = require('ormconfig.json');

describe('ParticipationService', () => {
  let app: INestApplication;
  let service: ParticipationService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...defaultDBConfig, database: 'mtb-nest-test', logging: false }),
        ParticipationModule
      ],
      providers: [ParticipationService]
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = module.get<ParticipationService>(ParticipationService);
  });

  afterEach(async () => {
    await getRepository(Participation).delete({});
    await getRepository(User).delete({});
    await getRepository(Ride).delete({});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#create', () => {
    it('returns true if the participation is created', async () => {
      const [_, count] = await getRepository(Participation).findAndCount();
      expect(count).toEqual(0);
      const ride = await getRepository(Ride)
        .create({
          trailId: '1234',
          location: 'Asheville, NC',
          date: new Date(),
          time: new Date()
        })
        .save();
      const user = await getRepository(User)
        .create({
          email: 'bob@email.com',
          password: 'password',
          name: 'Bob'
        })
        .save();
      // TODO: create ride
      // TODO: create user
      // TODO: clear db
      const result = await service.create(ride.id, user.id);
      expect(result).toEqual(true);
    });

    it('returns false if an error occurs', async () => {
      const result = await service.create(1, 2);
      expect(result).toEqual(false);
    });
  });
});
