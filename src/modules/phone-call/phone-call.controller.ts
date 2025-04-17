import { Controller, Get, Post, Body, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { PhoneCallService } from './phone-call.service';
import { CreatePhoneCallDto } from './dto/create-phone-call.dto';
import { UpdatePhoneCallDto } from './dto/update-phone-call.dto';
import { Constants } from 'src/core/constants/constansts';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('phone-call')
export class PhoneCallController {
  constructor(private readonly phoneCallService: PhoneCallService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPhoneCallDto: CreatePhoneCallDto) {
    return this.phoneCallService.create(createPhoneCallDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query: any) { // TODO! enum for params
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? this.phoneCallService.findMany(query)
      : this.phoneCallService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phoneCallService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updatePhoneCallDto: UpdatePhoneCallDto) {
    return this.phoneCallService.update(+id, updatePhoneCallDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phoneCallService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post(Constants.API.WEB_HOOK)
  @Get(Constants.API.WEB_HOOK)
  @Put(Constants.API.WEB_HOOK)
  @Put(Constants.API.WEB_HOOK)
  webHookNotify(@Body() body: string | Object) {
    const notification = typeof body === 'string' ? JSON.parse(body) : body;
    return this.phoneCallService.webHookNotify(notification);
  }
}
