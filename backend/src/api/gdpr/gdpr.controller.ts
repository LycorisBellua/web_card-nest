import {
  Get,
  Post,
  Body,
  Controller,
  Res,
  Req,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request as ExpressRequest } from 'express';
import JSZip from 'jszip';
import { ExportAllDto } from './dto/export-all.dto';
import { GdprService } from './gdpr.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { JwtPayload } from '../auth/jwt/auth.jwt-payload';

@Controller('api/gdpr')
export class GdprController {
  constructor(private readonly GdprService: GdprService) {}

  @UseGuards(AuthGuard)
  @Get('export/profile')
  async ExportUserData(@Res() res: Response, @Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    const data = await this.GdprService.GetProfileData(user.id);
    res.setHeader('Content-Type', 'application/JSON');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gdpr_compliance_profile_data.json"`,
    );
    res.send(JSON.stringify(data, null, 2));
    await this.GdprService.SendExtractDataConfirmationEmail(user.id, [
      'User Profile',
    ]);
  }

  @UseGuards(AuthGuard)
  @Get('export/lobby')
  async ExportLobbyData(@Res() res: Response, @Req() req: ExpressRequest) {
    const user = req['user'] as JwtPayload;
    const data = await this.GdprService.GetLobbyData(user.id);
    res.setHeader('Content-Type', 'application/JSON');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gdpr_compliance_lobby_data.json"`,
    );
    res.send(JSON.stringify(data, null, 2));
    if (!data.lobbyMessages.length) return;
    await this.GdprService.SendExtractDataConfirmationEmail(user.id, [
      'Lobby Chat',
    ]);
  }

  @UseGuards(AuthGuard)
  @Get('export/dm/:friendId')
  async ExportDMData(
    @Res() res: Response,
    @Req() req: ExpressRequest,
    @Param('friendId') friendId: string,
  ) {
    const user = req['user'] as JwtPayload;
    const friendName = await this.GdprService.FindFriendName(friendId);
    const data = await this.GdprService.GetDMData(user.id, friendId);
    res.setHeader('Content-Type', 'application/JSON');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="gdpr_compliance_dm_data_${friendName.toLowerCase()}.json"`,
    );
    res.send(JSON.stringify(data, null, 2));
    await this.GdprService.SendExtractDataConfirmationEmail(user.id, [
      `DM Thread with ${friendName}`,
    ]);
  }

  @UseGuards(AuthGuard)
  @Post('export/all')
  async ExportAllData(
    @Res() res: Response,
    @Req() req: ExpressRequest,
    @Body() dto: ExportAllDto,
  ) {
    const user = req['user'] as JwtPayload;

    if (!dto.profile && !dto.lobby && !dto.friendIds?.length) {
      return res.status(400).json({ message: 'No data categories selected.' });
    }

    const categories: string[] = [];
    const zip = new JSZip();

    if (dto.profile) {
      const data = await this.GdprService.GetProfileData(user.id);
      zip.file('card_nest_profile.json', JSON.stringify(data, null, 2));
      categories.push('User Profile');
    }
    if (dto.lobby) {
      const lobby = await this.GdprService.GetLobbyData(user.id);
      zip.file('card_nest_lobby.json', JSON.stringify(lobby, null, 2));
      if (lobby.lobbyMessages.length) categories.push('Lobby Chat');
    }
    if (dto.friendIds?.length) {
      for (const friendId of dto.friendIds) {
        const friendName = await this.GdprService.FindFriendName(friendId);
        const data = await this.GdprService.GetDMData(user.id, friendId);
        zip.file(
          `card_nest_dm_${friendName.toLowerCase()}.json`,
          JSON.stringify(data, null, 2),
        );
        categories.push(`DM Thread with ${friendName}`);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="gdpr_compliance_all_data.zip"',
    );
    res.send(zipBuffer);

    if (categories.length) {
      await this.GdprService.SendExtractDataConfirmationEmail(
        user.id,
        categories,
      );
    }
  }
}
