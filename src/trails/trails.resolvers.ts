import { Query, Resolver, Args, Context } from '@nestjs/graphql';
import { TrailsService } from './trails.service';
import { Logger } from '@nestjs/common';

@Resolver()
export class TrailsResolvers {
  constructor(private trailsService: TrailsService) {}

  @Query('trails')
  async getTrails(@Args('location') location: string, @Context('req') req: any) {
    var ipAddress;
    // Amazon EC2 / Heroku workaround to get real client IP
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
      // 'x-forwarded-for' header may return multiple IP addresses in
      // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
      // the first one
      var forwardedIps = forwardedIpsStr.split(',');
      ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
      // Ensure getting client IP address still works in
      // development environment
      ipAddress = req.connection.remoteAddress;
    }
    Logger.log(`Let's see what the ip is ${ipAddress}`);
    return this.trailsService.getByLocation(location);
  }
}
