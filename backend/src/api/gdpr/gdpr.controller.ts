import { Get, Controller, Res, Req, UseGuards } from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import { GdprService } from './gdpr.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';

@Controller('api/gdpr')
export class GdprController {
  constructor(private readonly GdprService: GdprService) {}

  @UseGuards(AuthGuard)
  @Get('exportJSON')
  async ExportUserDataJSON(@Res() res: Response, @Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    const data = await this.GdprService.GetAllUserData(user.id);
    res.setHeader('Content-Type', 'application/JSON');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="GRPD_compliance_personal_data.json"`,
    );
    res.send(JSON.stringify(data, null, 2));
    await this.GdprService.SendExtractDataConfirmationEmail(user.id);
  }
}
