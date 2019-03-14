import {
  ManyToOne,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  BeforeInsert,
  OneToMany,
  Index
} from 'typeorm';
import { User } from 'src/users/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { Participation } from 'src/participation/participation.entity';

@Entity('rides')
// @Index(['latitude', 'longitude'])
export class Ride extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trailId: string;

  @Column('geography', {
    spatialFeatureType: 'Point',
    srid: 4326
  })
  @Index({ spatial: true })
  location: object;

  @Column({ type: 'date' })
  date: Date;

  // TODO: Maybe this should be type: 'time'
  @Column({ type: 'date' })
  time: Date;

  @ManyToOne((type) => User, (user) => user.rides, { eager: true, onDelete: 'CASCADE' })
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
