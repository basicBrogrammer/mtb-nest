import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
// import { Ride } from './Ride';

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

  // @OneToMany((type) => Ride, (ride) => ride.user)
  // rides: Ride[];
}
