import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { JwtPayload } from './interfaces/jwt_payload.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getToken(user: User): Promise<any> {
    return this.jwtService.sign({ id: user.id, email: user.email, name: user.name });
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    return await User.findOne({ email: payload.email });
  }
}
