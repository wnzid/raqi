import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus,Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger=new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const prismaCode=typeof exception==='object'&&exception!==null&&'code'in exception?String((exception as{code?:unknown}).code):undefined;
    const status = exception instanceof HttpException ? exception.getStatus() : prismaCode==='P1001'?HttpStatus.SERVICE_UNAVAILABLE:HttpStatus.INTERNAL_SERVER_ERROR;
    if(!(exception instanceof HttpException)){
      const error=exception instanceof Error?exception:new Error(String(exception));
      this.logger.error({route:`${request.method} ${request.url}`,exceptionType:error.constructor.name,message:error.message,prismaCode,stack:error.stack});
    }
    const detail = exception instanceof HttpException ? exception.getResponse() : prismaCode==='P1001'?'Database temporarily unavailable':'Internal server error';
    response.status(status).json({ statusCode: status, path: request.url, timestamp: new Date().toISOString(), detail });
  }
}
