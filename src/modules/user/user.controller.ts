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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Constants } from 'src/core/constants/constants';
import { AuthGuard } from 'src/core/guards/auth.guard';

@Controller(Constants.API.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post(Constants.API.CRUD)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get(Constants.API.CRUD)
  findAll(@Query() query: any) {
    const queryKeys = Object.keys(query);

    return queryKeys.length > 0
      ? this.userService.findMany(query)
      : this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(`/${Constants.API.CRUD}/:id`)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(`/${Constants.API.CRUD}/:id`)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(`/${Constants.API.CRUD}/:id`)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
