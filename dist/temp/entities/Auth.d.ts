import { Models } from "./Models";
export declare namespace ServerAuth {
    type IPayload = Pick<Models.User, 'id' | 'email' | 'isActivated' | 'roleLevel'> & {
        customRoleName: string;
    };
    class Payload implements IPayload {
        id: number;
        email: string;
        isActivated: boolean;
        roleLevel: number;
        customRoleName: string;
        constructor(options: IPayload);
    }
    interface AuthGetResponse {
        user: IPayload;
        accessToken: string;
        refreshToken: string;
    }
}
