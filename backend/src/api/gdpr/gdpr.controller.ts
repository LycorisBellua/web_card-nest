import {  Param, ParseUUIDPipe, Get, Controller, Res } from '@nestjs/common';
import type { Response } from 'express';
import { GdprService } from './gdpr.service';



@Controller('api/gdpr')
export class GdprController{
    constructor(private readonly GdprService: GdprService){}
    
    @Get(':originId/exportJSON')
    async ExportUserDataJSON(@Param('originId', ParseUUIDPipe) originId: string, @Res() res: Response)
    {
        const data = await this.GdprService.GetAllUserData(originId);
        res.setHeader('Content-Type', 'application/JSON');
        res.setHeader('Content-Disposition', `attachment; filename="GRPD_compliance_personal_data.json"`);
        res.send(JSON.stringify(data,null,2));
    }

    @Get(':originId/exportCSV')
    async ExportUserDataCSV(@Param('originId', ParseUUIDPipe) originId: string, @Res() res: Response)
    {
        const raw = await this.GdprService.GetAllUserData(originId);
        const data = Object.entries(raw).flatMap(([section, value]) => {
        if (Array.isArray(value)) {
          return value.map((item: any) => ({ section, ...item }));
        } else if (typeof value === 'object' && value !== null) {
          return [{ section, ...value }];
        } else {
          return [{ section, value }];
        }
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="GRPD_compliance_personal_data.csv"`);
        res.send(data);
    }


}


