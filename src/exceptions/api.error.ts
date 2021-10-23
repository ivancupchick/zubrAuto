export class ApiError extends Error {
  constructor(public status: number, message: string, public errors = []) {
    super(message);
  }

  static UnauthorizedError() {
    return new ApiError(401, 'Пользователь не авторизован')
  }

  static BadRequest(message: string, errors = []) {
    return new ApiError(400, message, errors)
  }
}
