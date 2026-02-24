import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, NotFoundException, Injectable
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SsrService } from './ssr/ssr.service';

@Injectable()
@Catch()
export class FallbackFilter implements ExceptionFilter {
  constructor(private readonly ssrService: SsrService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isApiRoute = request.url.startsWith('/api/');

    if (!isApiRoute && exception instanceof NotFoundException) {
      const html = await this.ssrService.render(request.url);
      return response.status(200).send(html);
    }

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error';

    response.status(status).json({ statusCode: status, message });
  }
}
