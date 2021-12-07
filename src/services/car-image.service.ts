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
      return r;
    });
  }

  async getCarFiles(carId: number): Promise<ServerFile.Response[]> {
    const parentFolder = await fileRepository.findOne({ name: [`${carId}`], type: [`${ServerFile.Types.Folder}`] });

    return parentFolder
      ? this.getFiles(parentFolder.id)
      : [];
  }
}

export = new CarImageService();
