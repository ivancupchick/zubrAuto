import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ServerRole } from 'src/temp/entities/Role';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class RoleService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRoleDto: CreateRoleDto): Promise<{
        id: number;
        systemName: string;
    }>;
    findAll(): Promise<ServerRole.Response[]>;
    findOne(id: number): Promise<ServerRole.Response>;
    update(id: number, updateRoleDto: UpdateRoleDto): Promise<{
        id: number;
        systemName: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        systemName: string;
    }>;
}
