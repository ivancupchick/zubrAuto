"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== 'production') {
    dotenv_1.default.config();
}
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
class S3Service {
    constructor() {
        this.s3 = new s3_1.default({
            region,
            accessKeyId,
            secretAccessKey
        });
    }
    uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const timestamp = (new Date()).getTime().toString();
            const uploadParams = {
                Bucket: bucketName,
                Body: file.data,
                Key: `${timestamp}-${file.name}`
            };
            return this.s3.upload(uploadParams).promise();
        });
    }
}
module.exports = new S3Service();
//# sourceMappingURL=s3.service.js.map