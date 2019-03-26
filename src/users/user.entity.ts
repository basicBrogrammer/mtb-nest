import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Ride } from '../rides/ride.entity';
import { Comment } from '../comments/comment.entity';
import { Participation } from '../participation/participation.entity';
import { Notification } from '../notifications/notification.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column() password: string;

  @Column() name: string;

  @OneToMany((type) => Ride, (ride) => ride.user)
  rides: Promise<Ride[]>;

  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany((type) => Notification, (notification) => notification.user)
  notifications: Promise<Notification[]>;

  @OneToMany((type) => Participation, (participation) => participation.ride)
  participations: Promise<Participation[]>;

  @CreateDateColumn() createdAt: Date;

  @UpdateDateColumn() updatedAt: Date;
}
