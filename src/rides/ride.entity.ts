import {
  ManyToOne,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  OneToMany
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { Participation } from 'src/participation/participation.entity';

@Entity()
// @Index(['latitude', 'longitude'])
export class Ride extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trailId: string;

  @Column()
  location: string;

  @Column({ type: 'date' })
  date: Date;

  // TODO: Maybe this should be type: 'time'
  @Column({ type: 'date' })
  time: Date;

  @ManyToOne((type) => User, (user) => user.rides, { eager: true })
  user: User;

  @OneToMany((type) => Comment, (comment) => comment.ride)
  comments: Comment[];

  @OneToMany((type) => Participation, (participation) => participation.ride)
  participations: Participation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
