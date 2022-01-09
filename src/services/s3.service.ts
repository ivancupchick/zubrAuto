import request from 'request-promise';
import { ServerCar } from '../entities/Car';
import { RealField, ServerField } from '../entities/Field';
import S3 from 'aws-sdk/clients/s3';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import dotenv from 'dotenv';


if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;


class S3Service {
  s3: S3;

  constructor() {
    this.s3 = new S3({
      region,
      accessKeyId,
      secretAccessKey
    })
  }

  async uploadFile(file: UploadedFile) {
    const timestamp = (new Date()).getTime().toString();
    const uploadParams = {
      Bucket: bucketName,
      Body: file.data,
      Key: `${timestamp}-${file.name}`
    }

    return this.s3.upload(uploadParams).promise();
  }
}



export = new S3Service();
