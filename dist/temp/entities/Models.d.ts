export declare namespace Models {
    enum Table {
        Cars = "cars",
        CarOwners = "carOwners",
        Clients = "clients",
        Users = "users",
        UserTokens = "userTokens",
        FileChains = "filesIds",
        Files = "files",
        FieldChains = "fieldIds",
        Fields = "fields",
        Roles = "roles",
        FieldAccesses = "fieldAccesses",
        CarForms = "carForms",
        CarStatistic = "carStatistic",
        Activities = "activities",
        PhoneCalls = "phoneCalls",
        CallRequests = "callRequests",
        LongtextFieldsChains = "longtextFieldsIds"
    }
    interface Car {
        id: number;
        createdDate: string;
        ownerId: number;
    }
    interface CarOwner {
        id: number;
        number: string;
    }
    interface Client {
        id: number;
        carIds: string;
    }
    interface User {
        id: number;
        email: string;
        password: string;
        isActivated: boolean;
        activationLink?: string;
        roleLevel: number;
        deleted: boolean;
    }
    interface UserToken {
        id: number;
        userId: number;
        refreshToken: string;
    }
    interface FileChain {
        id: number;
        sourceId: number;
        fileId: number;
        sourceName: string;
    }
    interface File {
        id: number;
        url: string;
        type: number;
        name: string;
        parent: number;
        fileMetadata: string;
    }
    interface FieldChain {
        id: number;
        sourceId: number;
        fieldId: number;
        value: string;
        sourceName: string;
    }
    interface Field {
        id: number;
        name: string;
        flags: number;
        type: number;
        domain: number;
        variants: string;
        showUserLevel: number;
    }
    interface Role {
        id: number;
        systemName: string;
    }
    interface FieldAccess {
        id: number;
        fieldId: number;
        sourceId: number;
        sourceName: string;
        access: number;
    }
    interface CarForm {
        id: number;
        carId: number;
        content: string;
    }
    interface CarStatistic {
        id: number;
        carId: number;
        content: string;
        type: number;
        date: bigint;
    }
    interface Activity {
        id: number;
        userId: number;
        sourceId: number;
        sourceName: string;
        date: bigint;
        type: string;
        activities: string;
    }
    interface PhoneCall {
        id: number;
        originalNotifications: string;
        innerNumber: string;
        clientNumber: string;
        createdDate: bigint;
        userId: number;
        originalDate: string;
        uuid: string;
        type: string;
        status: string;
        isFinished: boolean;
        recordUrl: string;
        isUsed: boolean;
    }
    interface CallRequest {
        id: number;
        originalNotification: string;
        innerNumber: string;
        clientNumber: string;
        createdDate: bigint;
        userId: number;
        comment: string;
        source: string;
        isUsed: boolean;
    }
}
