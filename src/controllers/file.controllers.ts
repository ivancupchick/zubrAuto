import { NextFunction, Request, Response } from 'express'
// import { validationResult } from 'express-validator';
// import { ServerFile } from '../entities/File';
// import { ApiError } from '../exceptions/api.error';
// import fileService from '../services/file.service';
// import { BaseController } from './base.conroller';

class FileController {
  // getAllFiles = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const errors = validationResult(req);

  //     if (!errors.isEmpty()) {
  //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //     }

  //     const files = await fileService.getAll();

  //     return res.json(files);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async createFile(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //   }

  //     const newFile: ServerFile.CreateRequest = req.body;
  //     const file = await fileService.create(newFile);
  //     return res.json(file);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async getFile(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);

  //     if (!errors.isEmpty()) {
  //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //     }

  //     const id = +req.params.fileId;
  //     const file = await fileService.get(id);

  //     return res.json(file);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async deleteFile(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);

  //     if (!errors.isEmpty()) {
  //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //     }

  //     const id = +req.params.fileId;
  //     const file = await fileService.delete(id);

  //     return res.json(file);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async updateFile(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);

  //     if (!errors.isEmpty()) {
  //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //     }

  //     const id = +req.params.fileId;
  //     const updatedFile: ServerFile.UpdateRequest = req.body;
  //     const file = await fileService.update(id, updatedFile);

  //     return res.json(file);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async createFilesByLink(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const errors = validationResult(req);

  //   if (!errors.isEmpty()) {
  //     throw ApiError.BadRequest('Ошибка при валидации', errors.array());
  //   }

  //     const body: ServerFile.CreateByLink = req.body;
  //     const files = await fileService.createFilesByLink(body);
  //     return res.json(files);
  //   } catch (e) {
  //     next(e);
  //   }
  // }

  // async uploadFile(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const file = req.files.file

  //     // const
  //     return res.json(files);
  //   } catch (e) {
  //     next(e);
  //   }
  // }
}

export = new FileController();
