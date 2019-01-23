import { Test, TestingModule } from '@nestjs/testing';
import { RidesService } from './rides.service';
import { TrailsModule } from 'src/trails/trails.module';
import { User } from 'src/users/user.entity';
import { Ride } from './ride.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepository, Repository, getConnection } from 'typeorm';
import { Participation } from 'src/participation/participation.entity';
import { UnauthorizedException } from '@nestjs/common';
const defaultDBConfig = require('ormconfig.json');
const userDefaults = {
  email: 'bob@email.com',
  password: 'password',
  name: 'Bob'
};
const rideDefaults = {
  trailId: '7042687',
  date: new Date(),
  time: new Date(),
  location: 'Bent Creek, North Carolina'
};

describe('RidesService', () => {
  let service: RidesService;
  let userRepo: Repository<User>;
  let rideRepo: Repository<Ride>;
  let participationRepo: Repository<Participation>;
  let user: User;
  let participant: User;
  let ride: Ride;
  let participation: Participation;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({ ...defaultDBConfig, database: 'mtb-nest-test', logging: false }),
        TrailsModule
      ],
      providers: [RidesService]
    }).compile();
    userRepo = getRepository(User);
    rideRepo = getRepository(Ride);
    participationRepo = getRepository(Participation);

    service = module.get<RidesService>(RidesService);
  });

  afterEach(async () => {
    // cleanDB([Participation, User, Ride]);
    //await participationRepo.delete({});
    //await rideRepo.delete({});
    //await userRepo.delete({});
    return getConnection().synchronize(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#getRidesForUser', () => {
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        user = await userRepo.create(userDefaults).save();

        ride = await rideRepo.create(rideDefaults);
        ride.user = user;
        // returns a Promise
        await ride.save();
        fullfill();
      });
    });
    it('should return rides for a specific user', async () => {
      const results = await service.getRidesForUser(user);
      expect(results).toHaveLength(1);
      expect(results.map((result) => result.id)).toEqual(expect.arrayContaining([ride.id]));
    });

    it('will not return rides for another user', async () => {
      const otherUser = await userRepo.create({ ...userDefaults, email: 'bob1@email' }).save();

      const results = await service.getRidesForUser(otherUser);
      expect(results).toHaveLength(0);
      await expect(rideRepo.find()).resolves.toHaveLength(1);
    });
  });

  describe('#getParticipatingRidesForUser', () => {
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        user = await userRepo.create(userDefaults).save();
        ride = await rideRepo.create(rideDefaults);
        ride.user = user;
        await ride.save();

        participant = await userRepo.create({ ...userDefaults, email: 'bob1@email.com' }).save();
        participation = await participationRepo
          .create({ rideId: ride.id, userId: participant.id })
          .save();
        await expect(rideRepo.find()).resolves.toHaveLength(1);
        await expect(userRepo.find()).resolves.toHaveLength(2);
        await expect(participationRepo.find()).resolves.toHaveLength(1);
        fullfill();
      });
    });

    it('returns rides for accepted participations', async () => {
      participation.status_enum = 1;
      await participation.save();
      expect(participation.status()).toBe('accepted');
      await expect(participationRepo.find({ userId: participant.id })).resolves.toHaveLength(1);
      await expect(service.getParticipatingRidesForUser(participant)).resolves.toHaveLength(1);
    });

    it('does not returns rides for rejected participations', async () => {
      participation.status_enum = 2;
      await participation.save();
      expect(participation.status()).toBe('rejected');
      await expect(participationRepo.find({ userId: participant.id })).resolves.toHaveLength(1);
      await expect(service.getParticipatingRidesForUser(participant)).resolves.toHaveLength(0);
    });

    it('does not returns rides for pending participations', async () => {
      participation.status_enum = 0;
      await participation.save();
      expect(participation.status()).toBe('pending');
      await expect(participationRepo.find({ userId: participant.id })).resolves.toHaveLength(1);
      await expect(service.getParticipatingRidesForUser(participant)).resolves.toHaveLength(0);
    });
  });

  describe('#createRide', () => {
    it('creates a ride with given attributes', async () => {
      user = await userRepo.create(userDefaults).save();
      await expect(user.rides).resolves.toHaveLength(0);
      const result = await service.createRide({ ...rideDefaults, user });
      expect(result).toBeInstanceOf(Ride);
      await expect(rideRepo.find({ where: { userId: user.id } })).resolves.toHaveLength(1);

      // TODO: why do i have to reload
      await expect(userRepo.find()).resolves.toHaveLength(1);
      user = await userRepo.findOne(user.id);
      const userRides = await user.rides;
      expect(userRides).toHaveLength(1);
      expect(userRides[0].trailId).toBe(rideDefaults.trailId);
      expect(userRides[0].location).toBe('Bent Creek, North Carolina');
    });
  });

  describe('#updateRide', () => {
    it('updates a ride with new attributes', async () => {
      user = await userRepo.create(userDefaults).save();
      ride = await rideRepo.create(rideDefaults);
      ride.user = user;
      // returns a Promise
      await ride.save();
      user = await userRepo.findOne(user.id);
      let userRides = await user.rides;
      expect(userRides).toHaveLength(1);
      expect(userRides[0].trailId).toEqual(rideDefaults.trailId);
      await expect(rideRepo.find()).resolves.toHaveLength(1);

      const rideData = { trailId: '7014539', date: new Date(), time: new Date(), user };
      const result = await service.updateRide(ride.id, rideData);

      user = await userRepo.findOne(user.id);
      userRides = await user.rides;
      expect(userRides).toHaveLength(1);
      await expect(rideRepo.find()).resolves.toHaveLength(1);
      expect(userRides[0].trailId).not.toEqual(rideDefaults.trailId);
    });
    it('does not update another users ride', async () => {
      user = await userRepo.create(userDefaults).save();
      const otherUser = await userRepo.create({ ...userDefaults, email: 'bob1@email' }).save();
      ride = await rideRepo.create(rideDefaults);
      ride.user = otherUser;
      // returns a Promise
      await ride.save();

      const rideData = { trailId: '7014539', date: new Date(), time: new Date(), user };
      expect(service.updateRide(ride.id, rideData)).rejects.toThrowError(UnauthorizedException);
      await expect(rideRepo.find()).resolves.toHaveLength(1);
      ride = await rideRepo.findOne(ride.id);
      expect(ride.trailId).toEqual(rideDefaults.trailId);
      expect(ride.user.id).toEqual(otherUser.id);
    });
  });
});
