import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFile, UploadedFiles } from '@nestjs/common';
import { CarService } from './car.service';
import { Constants } from 'src/core/constants/constansts';
import { CarStatisticService } from './services/car-statistic.service';
import { CarStatistic } from 'src/temp/entities/CarStatistic';
import { ServerCar } from 'src/temp/entities/Car';
import { CarImageService } from './services/car-image.service';
import { AddCustomerDiscountDto } from './dto/add-customer-discount.dto';

@Controller(Constants.API.CARS) // TODO refactor
export class CarFunctionsController { // TODO think about anatoher name or structure
  constructor(private readonly carService: CarService, private readonly carStatisticService: CarStatisticService, private readonly carImageService: CarImageService) {}

  @Post(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_CALL }/:carId`) // TODO maybe PUT or PATCH ? need to think
  async addCustomerCall(@Param() params: any) {
    return await this.carStatisticService.addCustomerCall(+params.carId);
  }

  @Post(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_DISCOUNT }/:carId`) // TODO validation
  async addCustomerDiscount(@Param() params: any, @Body() body: AddCustomerDiscountDto) {
    return await this.carStatisticService.addCustomerDiscount(+params.carId, body.discount, body.amount);
  }

  @Post(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CALL }`) // TODO validation
  async addCall(@Body() body: { carIds: number[] }) {
    return await this.carStatisticService.addCall(body.carIds);
  }

  @Get(`/${ Constants.API.STATISTIC }/:carId`) // TODO validation
  async getAllCarStatistic(@Param() params: any) {
    return await this.carStatisticService.getAllCarStatistic(+params.carId);
  }

  @Get(`/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/:carId`) // TODO validation
  async getCarShowingStatistic(@Param() params: any) {
    return await this.carStatisticService.getCarShowingStatistic(+params.carId);
  }

  @Post(`/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/:carId`) // TODO validation
  async createCarShowing(@Param() params: any, @Body() body: { showingContent: CarStatistic.ShowingContent }) {
    return await this.carStatisticService.createCarShowing(+params.carId, body.showingContent);
  }

  @Put(`/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/:carId`) // TODO validation
  async updateCarShowing(@Param() params: any, @Body() body: { showingId: number, showingContent: CarStatistic.ShowingContent }) {
    return await this.carStatisticService.updateCarShowing(body.showingId, +params.carId, body.showingContent);
  }

  @Post(Constants.API.CREATE_CARS_BY_LINK) // TODO validation
  async createCarsByLink(@Body() body: ServerCar.CreateByLink) {
    return await this.carService.createCarsByLink(body);
  }

  @Post(Constants.API.CREATE_CARS_BY_MANAGER) // TODO validation
  async createCarsByManager(@Body() body: ServerCar.CreateByManager) {
    return await this.carService.createCarsByManager(body);
  }

  @Get(`/${Constants.API.IMAGES}/:carId`) // TODO validation
  async getCarFiles(@Param() params: any) {
    return await this.carImageService.getCarFiles(+params.carId);
  }

  @Delete(`/${Constants.API.IMAGES}/:carId/:imageId`) // TODO validation
  async deleteCarImage(@Param() params: any) {
    return await this.carImageService.deleteCarImage(+params.carId, +params.imageId);
  }

  @Post(Constants.API.IMAGES) // TODO validation
  async uploadCarImages(@Body() body: { carId: number, metadata: string }, @UploadedFile() uploadedFile: Express.Multer.File, @UploadedFiles() uploadedFiles: Array<Express.Multer.File>) {
    let files: Express.Multer.File[] = [];

    if (uploadedFile) {
      files = Array.isArray(uploadedFile)
        ? uploadedFile
        : [uploadedFile];
    }

    if (uploadedFiles) {
      files = uploadedFiles;
    }

    return await this.carImageService.uploadCarImages(+body.carId, files, body.metadata || '{}');
  }

  @Post(Constants.API.STATE_IMAGES) // TODO validation
  async uploadCarStateImages(@Body() body: { carId: number, metadata: string }, @UploadedFile() uploadedFile: Express.Multer.File, @UploadedFiles() uploadedFiles: Array<Express.Multer.File>) {
    let files: Express.Multer.File[] = [];

    if (uploadedFile) {
      files = Array.isArray(uploadedFile)
        ? uploadedFile
        : [uploadedFile];
    }

    if (uploadedFiles) {
      files = uploadedFiles;
    }

    return await this.carImageService.uploadCarStateImages(+body.carId, files, body.metadata || '{}');
  }

  @Post(Constants.API.IMAGE360) // TODO validation
  async uploadCarImage360(@Body() body: { carId: number, metadata: string }, @UploadedFile() uploadedFile: Express.Multer.File, @UploadedFiles() uploadedFiles: Array<Express.Multer.File>) {
    let files: Express.Multer.File[] = [];

    if (uploadedFile) {
      files = Array.isArray(uploadedFile)
        ? uploadedFile
        : [uploadedFile];
    }

    if (uploadedFiles) {
      files = uploadedFiles;
    }

    return await this.carImageService.uploadCarImage360(+body.carId, files[0], body.metadata || '{}');
  }
}
