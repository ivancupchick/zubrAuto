import { BadRequestException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
export declare class ApiError extends HttpException {
    errors: any[];
    constructor(status: HttpStatus, message: string, errors?: any[]);
    static UnauthorizedError(): UnauthorizedException;
    static BadRequest(message: string, errors?: any[]): BadRequestException;
}
