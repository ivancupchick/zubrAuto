import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getUI(@Res() res: Response) {
    res.sendFile(process.cwd()+"/ui/dist/index.html");
  }
}
