import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { CallRequestService } from './call-request.service';
import { CreateCallRequestDto } from './dto/create-call-request.dto';
import { UpdateCallRequestDto } from './dto/update-call-request.dto';
import { Constants } from 'src/core/constants/constants';
import { SitesCallRequest } from 'src/temp/models/sites-call-request';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller(Constants.API.CALL_REQUESTS)
export class CallRequestController {
  constructor(private readonly callRequestService: CallRequestService) {}

  @UseGuards(AuthGuard)
  @Post(Constants.API.CALL_REQUEST)
  callRequest(@Body() callRequest: SitesCallRequest) {
    return this.callRequestService.callRequest(callRequest);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query: any) { // TODO! enum for params
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? this.callRequestService.findMany(query)
      : this.callRequestService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callRequestService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateCallRequestDto: UpdateCallRequestDto) {
    return this.callRequestService.update(+id, updateCallRequestDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.callRequestService.remove(+id);
  }
}
