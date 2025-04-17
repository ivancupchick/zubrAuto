import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RoleController {
    private readonly roleService;
    constructor(roleService: RoleService);
    create(createRoleDto: CreateRoleDto): Promise<{
        id: number;
        systemName: string;
    }>;
    findAll(): Promise<import("../../temp/entities/Role").ServerRole.Response[]>;
    findOne(id: string): Promise<import("../../temp/entities/Role").ServerRole.Response>;
    update(id: string, updateRoleDto: UpdateRoleDto): Promise<{
        id: number;
        systemName: string;
    }>;
    remove(id: string): Promise<{
        id: number;
        systemName: string;
    }>;
}
