import { BadRequestException, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';

export class ApiError extends HttpException {
  constructor(status: HttpStatus, message: string, public errors = []) {
    super(message, status);
  }

  static UnauthorizedError(): UnauthorizedException {
    return new UnauthorizedException(null, 'Пользователь не авторизован');
    // return new ApiError(HttpStatus.UNAUTHORIZED, 'Пользователь не авторизован')
  }

  static BadRequest(message: string, errors = []): BadRequestException {
    return new BadRequestException(errors, message);
    // return new ApiError(HttpStatus.BAD_REQUEST, message, errors)
  }
}
