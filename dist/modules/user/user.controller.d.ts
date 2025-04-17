import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<import("../../temp/entities/Models").Models.User>;
    findAll(query: any): Promise<import("../../temp/entities/Types").BaseList<import("../../temp/entities/User").ServerUser.Response>>;
    findOne(id: string): Promise<import("../../temp/entities/User").ServerUser.Response>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        password: string;
        isActivated: boolean | null;
        activationLink: string | null;
        roleLevel: number;
        deleted: boolean;
    }>;
    remove(id: string): Promise<{
        id: number;
        email: string;
        password: string;
        isActivated: boolean | null;
        activationLink: string | null;
        roleLevel: number;
        deleted: boolean;
    }>;
}
