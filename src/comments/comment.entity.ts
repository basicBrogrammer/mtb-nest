import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column
} from 'typeorm';
import { User } from '../users/user.entity';
import { Ride } from '../rides/ride.entity';
// @Index(['latitude', 'longitude'])
@Entity('comments')
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;

  @Column({ nullable: true })
  rideId: number;
  @ManyToOne((type) => Ride, (ride) => ride.comments, { eager: true })
  ride: Ride;

  @Column()
  userId: number;
  @ManyToOne((type) => User, (user) => user.comments, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
