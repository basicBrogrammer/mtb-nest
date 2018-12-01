import { User } from 'src/users/user.entity';

export class CreateRide {
  readonly trailId: string;
  readonly date: Date;
  readonly time: Date;
  readonly user: User;
}
