import { Test, TestingModule } from '@nestjs/testing';
import { ParticipationService } from './participation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ParticipationModule } from './participation.module';
import { Ride } from 'src/rides/ride.entity';
import { getRepository, getConnection, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Participation } from './participation.entity';
import { rideDefaults, userDefaults, flushPromises, typeormTestConfig } from 'src/tests/db-helpers';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Notification } from 'src/notifications/notification.entity';

describe('ParticipationService', () => {
  let app: INestApplication;
  let service: ParticipationService;
  let owner: User;
  let ride: Ride;
  let participant: User;
  let participation: Participation;
  let userRepo: Repository<User>;
  let rideRepo: Repository<Ride>;
  let participationRepo: Repository<Participation>;
  let notificationRepo: Repository<Notification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeormTestConfig), NotificationsModule, ParticipationModule],
      providers: [ParticipationService]
    }).compile();
    userRepo = getRepository(User);
    rideRepo = getRepository(Ride);
    participationRepo = getRepository(Participation);
    notificationRepo = getRepository(Notification);
    app = module.createNestApplication();
    await app.init();
    service = module.get<ParticipationService>(ParticipationService);
  });

  afterEach(async () => {
    return getConnection().synchronize(true);
  });

  describe('#create', () => {
    it('returns true if the participation is created', async () => {
      ride = getRepository(Ride).create(rideDefaults);
      owner = await userRepo.create({ ...userDefaults, email: 'owner@email.com' }).save();
      ride.user = owner;
      await ride.save();
      const user = await getRepository(User)
        .create(userDefaults)
        .save();
      const result = await service.create(ride.id, user.id);
      expect(result).toEqual(true);
      await flushPromises(200);
      await expect(notificationRepo.find()).resolves.toHaveLength(1);
      await expect(notificationRepo.find({ where: { user: owner } })).resolves.toHaveLength(1);
      return expect(participationRepo.find()).resolves.toHaveLength(1);
    });

    it('returns false if an error occurs', async () => {
      const result = await service.create(1, 2);
      expect(result).toEqual(false);
      await flushPromises(200);
      await expect(notificationRepo.find({ where: { user: owner } })).resolves.toHaveLength(0);
      return expect(participationRepo.find()).resolves.toHaveLength(0);
    });
  });

  describe('#accept', () => {
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
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
      await flushPromises(500);
      await expect(notificationRepo.find()).resolves.toHaveLength(1);
      return await expect(
        notificationRepo.find({ where: { user: participant } })
      ).resolves.toHaveLength(1);
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
        userRepo = getRepository(User);
        rideRepo = getRepository(Ride);
        participationRepo = getRepository(Participation);

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
