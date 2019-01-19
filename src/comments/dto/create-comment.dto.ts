import { User } from 'src/users/user.entity';

export class CreateComment {
  readonly rideId: number;
  readonly body: string;
  readonly user: User;
}
