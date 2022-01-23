import { ICrudService } from "../entities/Types";
import carRepository from "../repositories/base/car.repository";
import fileRepository from "../repositories/base/file.repository";
import { Models } from "../entities/Models";
import { ServerFile } from "../entities/File";
import { UploadedFile } from "express-fileupload";
import s3Service from "./s3.service";
import fileChainRepository from "../repositories/base/file-chain.repository";
import { ManagedUpload } from "aws-sdk/clients/s3";


// implements ICrudService<ServerFile.CreateRequest, ServerFile.UpdateRequest, ServerFile.Response, ServerFile.IdResponse>

class CarImageService {
  async uploadCarImage(carId: number, files: UploadedFile[], fileMetadata: string): Promise<any> {
    // const extension = file.name.split('.').pop();

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (files.find(file => !imageTypes.includes(file.mimetype))) {
      throw new Error("Это не картинка");
    }


    const sendDataArray: ManagedUpload.SendData[] = await Promise.all(
      files.map(file => s3Service.uploadFile(file))
    ) ;

    const dbFiles = await Promise.all(
      sendDataArray.map((sendData, i) => {
        let metadata = {};
        (metadata as any).s3Information = sendData;

        const dbFile = {
          url: sendData.Location,
          type: ServerFile.Types.Image,
          name: files[i].name,
          parent: 0,
          fileMetadata: JSON.stringify(metadata),
        }

        return fileRepository.create(dbFile);
      })
    );

    await Promise.all(
      dbFiles.map(dbFile => {
        return fileChainRepository.create({
          sourceId: carId,
          sourceName: Models.CARS_TABLE_NAME,
          fileId: dbFile.id
        });
      })
    );

    return dbFiles;
  }

  async uploadCarStateImages(carId: number, files: UploadedFile[], fileMetadata: string): Promise<any> {
    // const extension = file.name.split('.').pop();

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (files.find(file => !imageTypes.includes(file.mimetype))) {
      throw new Error("Это не картинка");
    }


    const sendDataArray: ManagedUpload.SendData[] = await Promise.all(
      files.map(file => s3Service.uploadFile(file))
    ) ;

    const dbFiles = await Promise.all(
      sendDataArray.map((sendData, i) => {
        let metadata = {};
        (metadata as any).s3Information = sendData;

        const dbFile = {
          url: sendData.Location,
          type: ServerFile.Types.StateImage,
          name: files[i].name,
          parent: 0,
          fileMetadata: JSON.stringify(metadata),
        }

        return fileRepository.create(dbFile);
      })
    );

    await Promise.all(
      dbFiles.map(dbFile => {
        return fileChainRepository.create({
          sourceId: carId,
          sourceName: Models.CARS_TABLE_NAME,
          fileId: dbFile.id
        });
      })
    );

    return dbFiles;
  }

  async uploadCarImage360(carId: number, file: UploadedFile, fileMetadata: string): Promise<any> {
    // const extension = file.name.split('.').pop();

    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!imageTypes.includes(file.mimetype)) {
      throw new Error("Это не картинка");
    }

    const allImageFileChains = await fileChainRepository.find({ sourceName: [`${Models.CARS_TABLE_NAME}`], sourceId: [`${carId}`] })
    const allImageFiles = await fileRepository.getAll();

    const existImage360 = allImageFiles.find(file => file.type === ServerFile.Types.Image360 && allImageFileChains.find(ch => ch.sourceId === carId));

    if (existImage360) {
      await this.deleteCarImage(carId, existImage360.id);
    }

    const sendData: ManagedUpload.SendData = await s3Service.uploadFile(file)

    let metadata = {};
    (metadata as any).s3Information = sendData;

    const dbFile = {
      url: sendData.Location,
      type: ServerFile.Types.Image360,
      name: file.name,
      parent: 0,
      fileMetadata: JSON.stringify(metadata),
    }

    const dbFileRes = await fileRepository.create(dbFile);

    await fileChainRepository.create({
      sourceId: carId,
      sourceName: Models.CARS_TABLE_NAME,
      fileId: dbFileRes.id
    });

    return dbFileRes;
  }

  async getFiles(sourceId: number = null): Promise<ServerFile.Response[]> {
    const fileChainesExpression = {
      sourceName: [`${Models.CARS_TABLE_NAME}`]
    }

    if (sourceId) {
      (fileChainesExpression as any).sourceId = [`${sourceId}`];
    }

    const [
      files,
      fileChaines
    ] = await Promise.all([
      fileRepository.getAll(),
      fileChainRepository.find(fileChainesExpression),
    ]);

    const fileIds = fileChaines.map(fileChain => fileChain.fileId);

    const result = files
      .filter(file => fileIds.includes(file.id));

    return result.map(r => {
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

  async deleteCarImage(carId: number, imageId: number):Promise<ServerFile.IdResponse> {
    await fileChainRepository.deleteOne({ fileId: [`${imageId}`], sourceName: [`${Models.CARS_TABLE_NAME}`], sourceId: [`${carId}`] });
    const result = await fileRepository.deleteById(imageId);

    return result;
  }
}

export = new CarImageService();
