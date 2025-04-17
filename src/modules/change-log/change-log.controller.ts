import { Controller, Get, Post, Body, Put, Param, Query, UseGuards } from '@nestjs/common';
import { ChangeLogService } from './change-log.service';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller('change-log') // TODO constant
export class ChangeLogController {
  constructor(private readonly changeLogService: ChangeLogService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createChangeLogDto: CreateChangeLogDto) {
    return this.changeLogService.create(createChangeLogDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query: any) {
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? this.changeLogService.findMany(query)
      : this.changeLogService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.changeLogService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateChangeLogDto: UpdateChangeLogDto) {
    return this.changeLogService.update(+id, updateChangeLogDto);
  }

  // @UseGuards(AuthGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.changeLogService.remove(+id);
  // }
}
