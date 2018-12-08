import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Ride } from 'src/rides/ride.entity';
import { Comment } from 'src/comments/comment.entity';
import { Participation } from 'src/participation/participation.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany((type) => Ride, (ride) => ride.user)
  rides: Ride[];

  @OneToMany((type) => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany((type) => Participation, (participation) => participation.ride)
  participations: Participation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
