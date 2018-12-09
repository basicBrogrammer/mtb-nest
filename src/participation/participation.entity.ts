import {
  BaseEntity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  Column,
  ManyToOne
} from 'typeorm';
import { Ride } from 'src/rides/ride.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Participation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  status_enum: number;

  status(): string {
    switch (this.status_enum) {
      case 2:
        return 'rejected';
      case 1:
        return 'accepted';
      default:
        return 'pending';
    }
  }

  @Column()
  rideId: number;
  @ManyToOne((type) => Ride, (ride) => ride.participations)
  ride: Ride;

  @Column()
  userId: number;
  @ManyToOne((type) => User, (user) => user.participations)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}