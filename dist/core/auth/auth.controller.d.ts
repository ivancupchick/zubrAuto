import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { RegistationUserDto } from './dto/auth-registration.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registration(body: RegistationUserDto, res: Response): Promise<import("../../temp/entities/Auth").ServerAuth.AuthGetResponse>;
    login(body: {
        email: string;
        password: string;
    }, res: Response): Promise<import("../../temp/entities/Auth").ServerAuth.AuthGetResponse>;
    logout(req: Request, res: Response): Promise<boolean>;
    activate(params: any, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<import("../../temp/entities/Auth").ServerAuth.AuthGetResponse>;
}
