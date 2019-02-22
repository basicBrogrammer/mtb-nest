import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationService } from './participation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ParticipationModule } from './participation.module';
import { Ride } from 'src/rides/ride.entity';
import { getRepository, getConnection } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Participation } from './participation.entity';
import { rideDefaults, userDefaults } from 'src/tests/db-helpers';
const defaultDBConfig = require('ormconfig.json');

describe('ParticipationService', () => {
  let app: INestApplication;
  let service: ParticipationService;
  let owner: User;
  let ride: Ride;
  let participant: User;
  let participation: Participation;

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
    return getConnection().synchronize(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#create', () => {
    it('returns true if the participation is created', async () => {
      ride = await getRepository(Ride)
        .create(rideDefaults)
        .save();
      const user = await getRepository(User)
        .create(userDefaults)
        .save();
      const result = await service.create(ride.id, user.id);
      expect(result).toEqual(true);
    });

    it('returns false if an error occurs', async () => {
      const result = await service.create(1, 2);
      expect(result).toEqual(false);
    });
  });

  describe('#accept', () => {
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        const userRepo = getRepository(User);
        const rideRepo = getRepository(Ride);
        const participationRepo = getRepository(Participation);

        owner = await userRepo.create(userDefaults).save();

        ride = await rideRepo.create({ ...rideDefaults });
        ride.user = owner;
        await ride.save();

        participant = await userRepo.create({ ...userDefaults, email: 'bob1@email' }).save();

        participation = await participationRepo.create();
        participation.ride = ride;
        participation.user = participant;
        participation = await participation.save();
        fullfill();
      });
    });

    it('changes the status of the participation to accepted', async () => {
      expect(participation.status_enum).toBe(0);
      expect(participation.status()).toBe('pending');

      const result = await service.accept(participation.id, owner);
      expect(result).toBe(true);
      await participation.reload();
      expect(participation.status_enum).toBe(1);
      expect(participation.status()).toBe('accepted');
    });

    it('throws an UnauthorizedException if the owner doesnt match the ride owner', async () => {
      await expect(service.accept(participation.id, participant)).rejects.toThrowError(
        UnauthorizedException
      );
    });
  });

  describe('#reject', () => {
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        const userRepo = getRepository(User);
        const rideRepo = getRepository(Ride);
        const participationRepo = getRepository(Participation);

        owner = await userRepo.create(userDefaults).save();

        ride = await rideRepo.create({ ...rideDefaults });
        ride.user = owner;
        await ride.save();

        participant = await userRepo.create({ ...userDefaults, email: 'bob1@email' }).save();

        participation = await participationRepo.create();
        participation.ride = ride;
        participation.user = participant;
        participation = await participation.save();
        fullfill();
      });
    });

    it('changes the status of the participation to rejected', async () => {
      expect(participation.status_enum).toBe(0);
      expect(participation.status()).toBe('pending');

      const result = await service.reject(participation.id, owner);
      expect(result).toBe(true);

      await participation.reload();
      expect(participation.status_enum).toBe(2);
      expect(participation.status()).toBe('rejected');
    });

    it('throws an UnauthorizedException if the owner doesnt match the ride owner', async () => {
      expect(service.reject(participation.id, participant)).rejects.toThrowError(
        UnauthorizedException
      );
    });
  });
});
