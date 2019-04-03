import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  async getIpAddress(req: any): Promise<string> {
    // Pull IP Address from request =======================
    let ipAddress;
    // Amazon EC2 / Heroku workaround to get real client IP
    const forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
      // 'x-forwarded-for' header may return multiple IP addresses in
      // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
      // the first one
      const forwardedIps = forwardedIpsStr.split(',');
      ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
      // Ensure getting client IP address still works in
      // development environment
      ipAddress = req.connection.remoteAddress;
    }
    // ipAddress = '129.82.194.157';
    // ==============================================
    return ipAddress;
  }

  async geoIpAddress(ipAddress: string): Promise<any> {
    Logger.log(`IP: ${ipAddress}`);
    if (ipAddress.indexOf('f:192') < 0) {
      const ipInfo = await fetch(
        `https://ipinfo.io/${ipAddress}/json?token=${process.env.IPINFO}`
      ).then((res) => res.json());

      const [lat, lng] = ipInfo.loc.split(',').map((x) => parseFloat(x));
      return {
        type: 'Point',
        coordinates: [lat, lng]
      };
    }
  }
}
