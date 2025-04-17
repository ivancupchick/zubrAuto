import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Constants } from '../constants/constansts';
import { FieldDomains } from './fields';
import { AuthGuard } from '../guards/auth.guard';

@Controller(Constants.API.FIELDS)
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @UseGuards(AuthGuard)
  @Post(Constants.API.CRUD)
  create(@Body() createFieldDto: CreateFieldDto) {
    return this.fieldsService.create(createFieldDto);
  }

  @UseGuards(AuthGuard)
  @Get(Constants.API.CRUD)
  findAll() {
    return this.fieldsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(`/${ Constants.API.CRUD }/:id`)
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(`/${ Constants.API.CRUD }/:id`)
  update(@Param('id') id: string, @Body() updateFieldDto: UpdateFieldDto) {
    return this.fieldsService.update(+id, updateFieldDto);
  }

  @UseGuards(AuthGuard)
  @Delete(`/${ Constants.API.CRUD }/:id`)
  remove(@Param('id') id: string) {
    return this.fieldsService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Get(`/getFieldsByDomain/:domain`)
  getFieldsByDomain(@Param('domain') domain: FieldDomains) {
    return this.fieldsService.getFieldsByDomain(domain);
  }
}
