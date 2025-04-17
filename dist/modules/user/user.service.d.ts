import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Models } from 'src/temp/entities/Models';
import { BaseList } from 'src/temp/entities/Types';
import { StringHash } from 'src/temp/models/hashes';
import { ServerUser } from 'src/temp/entities/User';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { ServerField } from 'src/temp/entities/Field';
import { FieldsService } from 'src/core/fields/fields.service';
export declare class UserService {
    private prisma;
    private fieldChainService;
    private fieldsService;
    constructor(prisma: PrismaService, fieldChainService: FieldChainService, fieldsService: FieldsService);
    getUsers(users: Models.User[], usersFields: ServerField.Response[]): Promise<ServerUser.Response[]>;
    findAll(): Promise<BaseList<ServerUser.Response>>;
    findMany(query: StringHash): Promise<BaseList<ServerUser.Response>>;
    create(createUserDto: CreateUserDto): Promise<Models.User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        password: string;
        isActivated: boolean | null;
        activationLink: string | null;
        roleLevel: number;
        deleted: boolean;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string;
        password: string;
        isActivated: boolean | null;
        activationLink: string | null;
        roleLevel: number;
        deleted: boolean;
    }>;
    findOne(id: number): Promise<ServerUser.Response>;
}
