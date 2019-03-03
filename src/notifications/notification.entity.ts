import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Ride } from 'src/rides/ride.entity';
// @Index(['latitude', 'longitude'])
@Entity('notifications')
export class Notification extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;
  @Column({ default: false })
  read: boolean;

  // @Column()
  // userId: number;
  @ManyToOne((type) => User, (user) => user.notifications, { eager: true })
  user: User;

  @ManyToOne((type) => User, { eager: true })
  actor: User;

  @ManyToOne((type) => User, { eager: true })
  ride: Ride;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
