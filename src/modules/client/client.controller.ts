import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Constants } from 'src/core/constants/constants';
import { ControllerActivity } from 'src/core/decorators/activity.decorator';
import { ActivityType } from 'src/core/enums/activity-type.enum';
import { Models } from 'src/temp/entities/Models';
import { CompleteDealDto } from './dto/complete-deal.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller(Constants.API.CLIENTS)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(AuthGuard)
  @ControllerActivity({ type: ActivityType.CreateClient, sourceName: Models.Table.Clients })
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query: any) { // TODO! enum for params
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? this.clientService.findMany(query)
      : this.clientService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @ControllerActivity({ type: ActivityType.UpdateClient, sourceName: Models.Table.Clients })
  @Put(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @UseGuards(AuthGuard)
  @ControllerActivity({ type: ActivityType.DeleteClient, sourceName: Models.Table.Clients })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Post(Constants.API.COMPLETE_DEAL) // TODO TEST!!!!!
  async completeDeal(@Body() dto: CompleteDealDto) {
    return this.clientService.completeDeal(dto.clientId, dto.carId);
  }
}
