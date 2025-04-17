import { S3 } from 'aws-sdk';
export declare class S3Service {
    s3: S3;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<S3.ManagedUpload.SendData>;
}
