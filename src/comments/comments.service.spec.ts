import { Test, TestingModule } from '@nestjs/testing';

import { CommentsService } from './comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PubsubModule } from 'src/pubsub/pubsub.module';
import { CommentsModule } from './comments.module';
import { getRepository, getConnection, Repository } from 'typeorm';
import { Ride } from 'src/rides/ride.entity';
import { User } from 'src/users/user.entity';
import { Comment } from './comment.entity';
import { rideDefaults, userDefaults, flushPromises, typeormTestConfig } from 'src/tests/db-helpers';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Notification } from 'src/notifications/notification.entity';
import { Participation } from 'src/participation/participation.entity';

describe('CommentsService', () => {
  let service: CommentsService;
  let ride: Ride;
  let user: User;
  let comment: Comment;
  let commentRepo: Repository<Comment>;
  let userRepo: Repository<User>;
  let rideRepo: Repository<Ride>;
  let notificationRepo: Repository<Notification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeormTestConfig),
        NotificationsModule,
        CommentsModule,
        PubsubModule
      ],
      providers: [CommentsService]
    }).compile();
    commentRepo = getRepository(Comment);
    userRepo = getRepository(User);
    rideRepo = getRepository(Ride);
    notificationRepo = getRepository(Notification);
    service = module.get<CommentsService>(CommentsService);
  });
  afterEach(async () => {
    return getConnection().synchronize(true);
  });

  describe('#findByRideId', () => {
    let rideWithoutComments: Ride;
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        ride = await rideRepo.create(rideDefaults).save();
        user = await userRepo.create(userDefaults).save();
        comment = await commentRepo.create({ body: 'hello world', ride, user }).save();
        rideWithoutComments = await rideRepo.create(rideDefaults).save();
        fullfill();
      });
    });

    it('returns all comments for the specific ride', async () => {
      const result = await service.findByRideId(ride.id);
      expect(result).toHaveLength(1);
      expect(result[0].body).toEqual(comment.body);
      expect(result[0].id).toEqual(comment.id);
      expect(result[0].userId).toEqual(ride.id);
      expect(result[0].rideId).toEqual(user.id);
    });
    it('returns an empty array if there are no comments', async () => {
      const result = await service.findByRideId(rideWithoutComments.id);
      expect(result).toHaveLength(0);
    });
    it('returns an empty array if that ride doesnt exist', async () => {
      const result = await service.findByRideId(123);
      expect(result).toHaveLength(0);
    });
  });

  describe('#create', () => {
    it('creates a comment for a specified user and ride', async () => {
      await expect(commentRepo.find()).resolves.toHaveLength(0);
      await expect(notificationRepo.find()).resolves.toHaveLength(0);
      ride = rideRepo.create(rideDefaults);
      const rideOwner = await userRepo
        .create({ ...userDefaults, email: 'rideOwner@email.com' })
        .save();
      ride.user = rideOwner;
      await ride.save();
      user = await userRepo.create(userDefaults).save();

      const result = await service.create({ rideId: ride.id, body: 'testing 1 2 3', user });
      // wait for notifications to be created async
      await flushPromises(50);

      await expect(commentRepo.find()).resolves.toHaveLength(1);
      await expect(result.body).toEqual('testing 1 2 3');
      await expect(result.user.id).toEqual(user.id);
      await expect(result.ride.id).toEqual(ride.id);
      await expect(notificationRepo.find()).resolves.toHaveLength(1);
      return await expect(
        notificationRepo.find({ where: { user: rideOwner } })
      ).resolves.toHaveLength(1);
    });
  });

  describe('#deleteForUser', () => {
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        ride = await rideRepo.create(rideDefaults).save();
        user = await userRepo.create(userDefaults).save();
        comment = await commentRepo.create({ body: 'hello world', ride, user }).save();
        fullfill();
      });
    });

    it('will return true on success', async () => {
      expect(commentRepo.find()).resolves.toHaveLength(1);
      comment = await commentRepo.findOne();
      const result = await service.deleteForUser(user, comment.id);

      expect(result).toEqual(true);
      await expect(commentRepo.find()).resolves.toHaveLength(0);
    });

    it('will return false on error', async () => {
      const otherUser = await userRepo.create({ ...userDefaults, email: 'bob1@email.com' }).save();
      expect(commentRepo.find()).resolves.toHaveLength(1);
      const result = await service.deleteForUser(otherUser, comment.id);

      expect(result).toEqual(false);
      await expect(commentRepo.find()).resolves.toHaveLength(1);
    });
  });
});
