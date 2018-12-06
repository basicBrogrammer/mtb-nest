import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Ride } from 'src/rides/ride.entity';
// @Index(['latitude', 'longitude'])
@Entity()
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
