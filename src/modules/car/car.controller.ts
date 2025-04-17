import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Constants } from 'src/core/constants/constants';
import { CarRemoveDto } from './dto/car-remove.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller(Constants.API.CARS)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @UseGuards(AuthGuard)
  @Post(Constants.API.CRUD)
  create(@Body() createCarDto: CreateCarDto) {
    return this.carService.createCarInDB(createCarDto);
  }

  @UseGuards(AuthGuard)
  @Get(Constants.API.CRUD)
  findAll(@Query() query: any) {
    // TODO! enum for params
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? this.carService.findMany(query)
      : this.carService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(`/${Constants.API.CRUD}/:id`)
  findOne(@Param('id') id: string) {
    return this.carService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(`/${Constants.API.CRUD}/:id`)
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carService.update(+id, updateCarDto);
  }

  @UseGuards(AuthGuard)
  @Delete(`/${Constants.API.CRUD}/:id`)
  remove(@Param('id') id: string) {
    return this.carService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post(Constants.API.DELETE_CARS)
  removeMany(@Body() body: CarRemoveDto) {
    return this.carService.removeMany(body.carIds);
  }
}
