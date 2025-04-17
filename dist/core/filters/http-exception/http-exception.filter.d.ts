import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
export declare class HttpExceptionFilter<T> implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
}
