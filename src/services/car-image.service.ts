import { ICrudService } from "../entities/Types";
import fs from 'fs';
import carRepository from "../repositories/base/car.repository";
import fileRepository from "../repositories/base/file.repository";
import { Models } from "../entities/Models";
import { ServerFile } from "../entities/File";
import { UploadedFile } from "express-fileupload";


const relative_path = '../../';
const IMAGES_PATH = 'uploads/';
const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];

// implements ICrudService<ServerFile.CreateRequest, ServerFile.UpdateRequest, ServerFile.Response, ServerFile.IdResponse>

class CarImageService {
  async uploadCarImage(carId: number, file: UploadedFile, fileMetadata: string): Promise<ServerFile.IdResponse> {
    const extension = file.name.split('.').pop();
    const path = IMAGES_PATH + `${file.name}`;

    if (!imageTypes.includes(file.mimetype)) {
      throw new Error("Это не картинка");
    }

    if (fs.existsSync(path)) {
      throw new Error("Картинка уже существует");
    }

    const car = await carRepository.findById(carId);

    const carFolderExist = await fileRepository.findOne({ name: [`${car.id}`], type: [`${ServerFile.Types.Folder}`] });
    const parent = carFolderExist
      ? carFolderExist
      : await fileRepository.create({ name: `${car.id}`, type: ServerFile.Types.Folder, url: '', parent: -1, fileMetadata: '' });

    file.mv(path);
    file.mv('build/' + path);

    const dbFile = {
      url: path,
      type: ServerFile.Types.Image,
      name: file.name,
      parent: parent.id,
      fileMetadata,
    }

    const result = await fileRepository.create(dbFile);

    return result;
  }

  async getFiles(parent: number = null): Promise<ServerFile.Response[]> {
  const [
      files
    ] = await Promise.all([
      fileRepository.getAll(),
    ]);

    const result = files
      .filter(file => (!parent && !file.parent) ||
                      (parent && file.parent === parent)
      );

    console.log(result);

    return result.map(r => {
      // const url = r.url.split('\\');
      // const realUrl = url.join('//');
      // console.log(realUrl);

      // console.log(r.url.split('\\'));
      // console.log(url);
      // console.log(r.url);
      console.log(r);

      return r;
    });
  }

  async getCarFiles(carId: number): Promise<ServerFile.Response[]> {
    const parentFolder = await fileRepository.findOne({ name: [`${carId}`], type: [`${ServerFile.Types.Folder}`] });

    return parentFolder
      ? this.getFiles(parentFolder.id)
      : [];
  }

  // async create(carImageData: ServerFile.CreateRequest) {
  //   throw new Error("not implemented");

  //   const carImage = await carImageRepository.create({
  //     carIds: carImageData.carIds
  //   });

  //   await Promise.all(carImageData.fields.map(f => fieldChainService.createFieldChain({
  //     sourceId: carImage.id,
  //     fieldId: f.id,
  //     value: f.value,
  //     sourceName: Models.CLIENTS_TABLE_NAME
  //   })))

  //   return carImage;
  // }

  // async update(id: number, carImageData: ServerFile.CreateRequest) {
  //   throw new Error("not implemented");

  //   const carImage = await carImageRepository.updateById(id, {
  //     carIds: carImageData.carIds
  //   });

  //   await Promise.all(carImageData.fields.map(f => fieldChainRepository.update({
  //     value: f.value
  //   }, {
  //     fieldId: [f.id].map(c => `${c}`),
  //     sourceId: [id].map(c => `${c}`),
  //     sourceName: [Models.CLIENTS_TABLE_NAME]
  //   })))

  //   return carImage
  // }

  // async delete(id: number) {
  //   throw new Error("not implemented");

  //   const chaines = await fieldChainRepository.find({
  //     sourceId: [`${id}`],
  //     sourceName: [Models.CLIENTS_TABLE_NAME]
  //   });
  //   await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
  //   const carImage = await carImageRepository.deleteById(id);
  //   return carImage
  // }

  // async get(id: number): Promise<ServerFile.Response> {
  //   throw new Error("not implemented");

  //   const carImage = await carImageRepository.findById(id);
  //   const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.CarImage);
  //   const chaines = await fieldChainRepository.find({
  //     sourceId: [`${id}`],
  //     sourceName: [`${Models.CLIENTS_TABLE_NAME}`]
  //   });

  //   const result: ServerFile.Response = {
  //     id: carImage.id,
  //     carIds: carImage.carIds,
  //     fields: getFieldsWithValues(relatedFields, chaines, carImage.id)
  //   };

  //   return result;
  // }
}

export = new CarImageService();
