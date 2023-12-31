import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ExecutionContext,
  createParamDecorator,
  HttpStatus,
} from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { CreateAsociacionDto } from './dto/create-asociacion.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileService } from 'src/file/file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/file/multer.config';
// import { GetUser } from 'src/auth2/decorator/get-user.decorator';
import { JwtAuthGuard } from './jwtauth.guard';
import { AuthGuard } from '@nestjs/passport';

const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

@ApiBearerAuth()
@ApiTags('Asociaciones')
@Controller('asociaciones')
export class AsociacionesController {
  constructor(
    private readonly asociacionesService: AsociacionesService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  async getAll() {
    return this.asociacionesService.findAll();
  }

  @Get('/datafake')
  getFakeData() {
    return this.asociacionesService.generateData();
  }

  @Get(':id')
  async getOne(@Param('id') idAsociacion: string) {
    return this.asociacionesService.findOne(idAsociacion);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async deleteById( @GetUser() user: any, @Param('id') idAsociacion: string) {
    if (user.id !== idAsociacion)
      return { resp: 'Forbidden resource', status: HttpStatus.FORBIDDEN };

    return this.asociacionesService.delete(idAsociacion);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('profilePic', multerConfig))
  async updateAsociation(
  @GetUser() user: any,
    @Param('id') idAsociacion: string,
    @Body() body: CreateAsociacionDto,
    @UploadedFile() profilePic?: Express.Multer.File,
  ) {
    if (user.id !== idAsociacion)
      return { resp: 'Forbidden resource', status: HttpStatus.FORBIDDEN };
    if (profilePic) {
      const url = await this.fileService.createFiles(profilePic);
      return this.asociacionesService.update(idAsociacion, body, url);
    }
    return this.asociacionesService.update(idAsociacion, body);
  }
}
