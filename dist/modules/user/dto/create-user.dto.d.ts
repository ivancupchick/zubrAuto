import { RealField } from "src/temp/entities/Field";
import { ServerUser } from "src/temp/entities/User";
export declare class CreateUserDto implements ServerUser.CreateRequest {
    fields: RealField.Request[];
    email: string;
    password: string;
    isActivated: boolean;
    roleLevel: number;
    deleted: boolean;
}
