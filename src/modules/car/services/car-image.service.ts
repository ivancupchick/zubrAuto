import { Injectable } from '@nestjs/common';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { S3Service } from 'src/core/files/services/s3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServerFile } from 'src/temp/entities/File';
import { Models } from 'src/temp/entities/Models';

@Injectable()
export class CarImageService {
  constructor(
    private s3Service: S3Service,
    private prisma: PrismaService,
  ) {}

  async uploadCarImages(
    carId: number,
    files: Express.Multer.File[],
    fileMetadata: string,
  ): Promise<any> {
    // const extension = file.name.split('.').pop();

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (files.find((file) => !imageTypes.includes(file.mimetype))) {
      throw new Error('Это не картинка');
    }

    const sendDataArray: ManagedUpload.SendData[] = await Promise.all(
      files.map((file) => this.s3Service.uploadFile(file)),
    );

    const dbFiles = await Promise.all(
      sendDataArray.map((sendData, i) => {
        let metadata = {};
        (metadata as any).s3Information = sendData;

        const dbFile = {
          url: sendData.Location,
          type: ServerFile.Types.Image,
          name: files[i].filename,
          parent: 0,
          fileMetadata: JSON.stringify(metadata),
        };

        return this.prisma.files.create({ data: dbFile });
      }),
    );

    await Promise.all(
      dbFiles.map((dbFile) => {
        return this.prisma.filesIds.create({
          data: {
            sourceId: carId,
            sourceName: Models.Table.Cars,
            fileId: dbFile.id,
          },
        });
      }),
    );

    return dbFiles;
  }

  async uploadCarStateImages(
    carId: number,
    files: Express.Multer.File[],
    fileMetadata: string,
  ): Promise<any> {
    // const extension = file.name.split('.').pop();

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (files.find((file) => !imageTypes.includes(file.mimetype))) {
      throw new Error('Это не картинка');
    }

    const sendDataArray: ManagedUpload.SendData[] = await Promise.all(
      files.map((file) => this.s3Service.uploadFile(file)),
    );

    const dbFiles = await Promise.all(
      sendDataArray.map((sendData, i) => {
        let metadata = {};
        (metadata as any).s3Information = sendData;

        const dbFile = {
          url: sendData.Location,
          type: ServerFile.Types.StateImage,
          name: files[i].filename,
          parent: 0,
          fileMetadata: JSON.stringify(metadata),
        };

        return this.prisma.files.create({ data: dbFile });
      }),
    );

    await Promise.all(
      dbFiles.map((dbFile) => {
        return this.prisma.filesIds.create({
          data: {
            sourceId: carId,
            sourceName: Models.Table.Cars,
            fileId: dbFile.id,
          },
        });
      }),
    );

    return dbFiles;
  }

  async uploadCarImage360(
    carId: number,
    file: Express.Multer.File,
    fileMetadata: string,
  ): Promise<any> {
    // const extension = file.name.split('.').pop();

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!imageTypes.includes(file.mimetype)) {
      throw new Error('Это не картинка');
    }

    const allImageFileChains = await this.prisma.filesIds.findMany({
      where: { sourceName: Models.Table.Cars, sourceId: carId },
    });
    const allImageFiles = await this.prisma.files.findMany();

    const existImage360 = allImageFiles.find(
      (file) =>
        file.type === ServerFile.Types.Image360 &&
        allImageFileChains.find((ch) => ch.sourceId === carId),
    ); // ch.sourceId === carId may not need?

    if (existImage360) {
      await this.deleteCarImage(carId, existImage360.id);
    }

    const sendData: ManagedUpload.SendData =
      await this.s3Service.uploadFile(file);

    let metadata = {};
    (metadata as any).s3Information = sendData;

    const dbFile = {
      url: sendData.Location,
      type: ServerFile.Types.Image360,
      name: file.filename,
      parent: 0,
      fileMetadata: JSON.stringify(metadata),
    };

    const dbFileRes = await this.prisma.files.create({ data: dbFile });

    await this.prisma.filesIds.create({
      data: {
        sourceId: carId,
        sourceName: Models.Table.Cars,
        fileId: dbFileRes.id,
      },
    });

    return dbFileRes;
  }

  private async getFiles(
    sourceId: number = null,
  ): Promise<ServerFile.Response[]> {
    const fileChainesExpression = {
      sourceName: Models.Table.Cars,
    };

    if (sourceId) {
      (fileChainesExpression as any).sourceId = sourceId;
    }

    const [files, fileChaines] = await Promise.all([
      this.prisma.files.findMany(),
      this.prisma.filesIds.findMany({ where: fileChainesExpression }),
    ]);

    const fileIds = fileChaines.map((fileChain) => fileChain.fileId);

    const result = files.filter((file) => fileIds.includes(file.id));

    return result.map((r) => {
      return r;
    });
  }

  async getCarFiles(carId: number): Promise<ServerFile.Response[]> {
    try {
      return await this.getFiles(carId);
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async deleteCarImage(
    carId: number,
    imageId: number,
  ): Promise<ServerFile.IdResponse> {
    const result = await this.prisma.filesIds.deleteMany({
      where: {
        fileId: imageId,
        sourceName: Models.Table.Cars,
        sourceId: carId,
      },
    });
    // const result = await fileRepository.deleteById(imageId);

    return result[0];
  }
}
