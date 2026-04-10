import {  Param, ParseUUIDPipe, Get, Controller } from '@nestjs/common';
import { gdprService } from './gdpr.service';

@Controller('api/gdpr')
export class gdprController{
    constructor(private readonly gdprService: gdprService){}

    @Get(':originId')
    async getAllUserData(@Param('originId', ParseUUIDPipe) originId: string)
    {
        return await this.gdprService.getAllUserData(originId);
    }
}
