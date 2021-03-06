import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, getRepository, getConnection } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Ride } from 'src/rides/ride.entity';
import { Participation } from 'src/participation/participation.entity';
import {
  rideDefaults,
  userDefaults,
  typeormTestConfig,
  boulderLocation
} from 'src/tests/db-helpers';
import { NotificationsModule } from './notifications.module';
import { Notification } from './notification.entity';
import { Comment } from 'src/comments/comment.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let userRepo: Repository<User>;
  let rideRepo: Repository<Ride>;
  let participationRepo: Repository<Participation>;
  let notificationRepo: Repository<Notification>;
  let commentRepo: Repository<Comment>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeormTestConfig), NotificationsModule],
      providers: [NotificationsService]
    }).compile();
    userRepo = getRepository(User);
    rideRepo = getRepository(Ride);
    participationRepo = getRepository(Participation);
    commentRepo = getRepository(Comment);
    notificationRepo = getRepository(Notification);

    service = module.get<NotificationsService>(NotificationsService);
  });
  afterEach(async () => {
    return getConnection().synchronize(true);
  });

  describe('#notificationsForUser', () => {
    it('should return notifications for given user', async () => {
      const user = await userRepo.create(userDefaults).save();
      const otherUser = await userRepo.create({ ...userDefaults, email: 'other@email.com' }).save();
      const rideOwner = await userRepo.create({ ...userDefaults, email: 'rideOwner@email' }).save();
      const ride = await rideRepo.create({ ...rideDefaults, user: rideOwner }).save();
      const targetNotification = await notificationRepo
        .create({ body: 'hey', actor: rideOwner, user, ride })
        .save();
      const otherNotification = await notificationRepo
        .create({ body: 'bye', actor: rideOwner, user: otherUser, ride })
        .save();

      service.notificationsForUser(user).then((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toEqual(targetNotification.id);
        expect(result[0].body).toEqual('hey');
      });
    });
  });

  describe('#markAsRead', () => {
    it('should make all notifications as read for a given user', async () => {
      const user = await userRepo.create(userDefaults).save();
      const otherUser = await userRepo.create({ ...userDefaults, email: 'other@email.com' }).save();
      const rideOwner = await userRepo.create({ ...userDefaults, email: 'rideOwner@email' }).save();
      const ride = await rideRepo.create({ ...rideDefaults, user: rideOwner }).save();
      const targetNotification = await notificationRepo
        .create({ body: 'hey', actor: rideOwner, user, ride })
        .save();
      const otherNotification = await notificationRepo
        .create({ body: 'hey', actor: rideOwner, user: otherUser, ride })
        .save();

      await service.markAsRead(user);

      notificationRepo.find({ where: { user } }).then((notifications) => {
        notifications.forEach((notification) => {
          expect(notification.read).toEqual(true);
        });
      });

      notificationRepo.findOne(otherNotification.id).then((notification) => {
        expect(notification.read).toEqual(false);
      });
    });
  });

  describe('#participationCreated', () => {
    it("should notify the ride's user of the new participation", async () => {
      let rideOwner = await userRepo.create(userDefaults).save();
      const actor = await userRepo.create({ ...userDefaults, email: 'actor@email.com' }).save(),
        ride = await rideRepo.create({ ...rideDefaults, user: rideOwner }).save(),
        participation = await participationRepo.create({ user: actor, ride }).save();

      expect(notificationRepo.find()).resolves.toHaveLength(0);
      expect(rideOwner.notifications).resolves.toHaveLength(0);

      await service.participationCreated(participation);

      expect(notificationRepo.find()).resolves.toHaveLength(1);
      // TODO: Why do i have to reload?
      rideOwner = await userRepo.findOne(rideOwner.id);
      rideOwner.notifications.then((notifications) => {
        expect(notifications).toHaveLength(1);
        const targetNotification = notifications[0];
        expect(targetNotification.body).toEqual(`<b>${actor.name}</b> wants to join your ride.`);
      });
    });
  });

  describe('#participationAccepted', () => {
    it('should notify the participant the owner accepted them', async () => {
      const rideOwner = await userRepo.create(userDefaults).save();
      let participant = await userRepo.create({ ...userDefaults, email: 'actor@email.com' }).save();
      const ride = await rideRepo.create({ ...rideDefaults, user: rideOwner }).save(),
        participation = await participationRepo.create({ user: participant, ride }).save();

      expect(notificationRepo.find()).resolves.toHaveLength(0);
      expect(participant.notifications).resolves.toHaveLength(0);

      await service.participationAccepted(participation);

      expect(notificationRepo.find()).resolves.toHaveLength(1);
      // TODO: Why do i have to reload?
      participant = await userRepo.findOne(participant.id);
      participant.notifications.then((notifications) => {
        expect(notifications).toHaveLength(1);
        const targetNotification = notifications[0];
        expect(targetNotification.body).toEqual(
          `<b>${rideOwner.name}</b> added you to their ride.`
        );
      });
    });
  });

  describe('#commentCreated', () => {
    // it.skip('should notify the ride ride owner without participants');
    it('should notify the ride owner and participants of the comment', async () => {
      const rideOwner = await userRepo.create(userDefaults).save(),
        commenter = await userRepo.create({ ...userDefaults, email: 'commenter@email.com' }).save(),
        acceptedParticipant = await userRepo
          .create({ ...userDefaults, email: 'acceptedParticipant@email.com' })
          .save(),
        pendingParticipant = await userRepo
          .create({ ...userDefaults, email: 'pendingParticipant@email.com' })
          .save(),
        randomUser = await userRepo
          .create({ ...userDefaults, email: 'randomUser@email.com' })
          .save();
      const notifiedUsers = [rideOwner, acceptedParticipant];
      const nonNotifiedUsers = [commenter, pendingParticipant, randomUser];

      const ride = await rideRepo.create({ ...rideDefaults, user: rideOwner }).save();
      await participationRepo.create({ user: acceptedParticipant, status_enum: 1, ride }).save();
      await participationRepo.create({ user: pendingParticipant, ride }).save();
      const comment = await commentRepo
        .create({ user: commenter, body: 'hello world', ride })
        .save();

      expect(notificationRepo.find()).resolves.toHaveLength(0);

      await service.commentCreated(comment);

      expect(notificationRepo.find()).resolves.toHaveLength(2);
      //// TODO: Why do i have to reload?
      notifiedUsers.forEach(async (notifiedUser) => {
        const user = await userRepo.findOne(notifiedUser.id);
        user.notifications.then((notifications) => {
          expect(notifications).toHaveLength(1);
          const targetNotification = notifications[0];
          expect(targetNotification.body).toEqual(
            `<b>${commenter.name}</b> commented on your ride.`
          );
        });
      });

      nonNotifiedUsers.forEach(async (nonNotifiedUser) => {
        expect(notificationRepo.find({ where: { user: nonNotifiedUser } })).resolves.toHaveLength(
          0
        );
      });
    });
  });

  describe('#rideCreated', () => {
    let user: User;
    let ride: Ride;
    let otherUserNearBy: User;
    let nearByUser: User;
    let userFarAway: User;
    beforeEach(async () => {
      return new Promise(async (fullfill, reject) => {
        user = await userRepo.create(userDefaults).save();
        nearByUser = await userRepo.create({ ...userDefaults, email: 'nearby@email.com' }).save();
        otherUserNearBy = await userRepo
          .create({ ...userDefaults, email: 'otheruser@email.com' })
          .save();
        userFarAway = await userRepo
          .create({
            ...userDefaults,
            email: 'farway@email.com',
            location: boulderLocation
          })
          .save();

        ride = await rideRepo.create(rideDefaults);
        ride.user = user;
        await ride.save();
        fullfill();
      });
    });
    it('should return rides for a specific user', async () => {
      expect(notificationRepo.find()).resolves.toHaveLength(0);
      expect(nearByUser.notifications).resolves.toHaveLength(0);
      expect(otherUserNearBy.notifications).resolves.toHaveLength(0);

      await service.rideCreated(ride);

      expect(notificationRepo.find()).resolves.toHaveLength(2);

      const checkUserNotifications = async (targetUser) => {
        targetUser = await userRepo.findOne(targetUser.id);
        return targetUser.notifications.then((notifications) => {
          expect(notifications).toHaveLength(1);
          expect(notifications[0].body).toEqual(
            `<b>${ride.user.name}</b> created a new ride near you.`
          );
          return notifications;
        });
      };

      await checkUserNotifications(nearByUser);
      await checkUserNotifications(otherUserNearBy);

      userFarAway = await userRepo.findOne(userFarAway.id);
      expect(userFarAway.notifications).resolves.toHaveLength(0);
    });
  });
});
