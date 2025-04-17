import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import sharp from 'sharp';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

@Injectable()
export class S3Service {
  s3: S3;

  constructor() {
    this.s3 = new S3({
      region,
      accessKeyId,
      secretAccessKey
    })
  }

  async uploadFile(file: Express.Multer.File) {
    const compressedBuffer = await sharp(file.buffer).jpeg({ quality: 20 }).toBuffer(); // TODO: test!

    const timestamp = (new Date()).getTime().toString();
    const uploadParams = {
      Bucket: bucketName,
      Body: compressedBuffer,
      Key: `${timestamp}-${file.filename}`
    }

    return this.s3.upload(uploadParams).promise();
  }
}
