import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Put,
  Query,
  HttpException,
  UseGuards,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { PublicationsUsersService } from './publications_users.service';
import { CreatePublicationsDto } from './dto/publications_users.dto';
import { multerConfig } from 'src/file/multer.config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/comments.dto';
// import { GetUser } from 'src/auth2/decorator/get-user.decorator';
// import { JwtAuthGuard } from 'src/auth2/jwtauth.guard';

const GetUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);

@ApiTags('Publications_user')
@Controller('publications_user')
export class PublicationsUsersController {
  constructor(private readonly publicationsService: PublicationsUsersService) {}

  @Get(':id?')
  async getall(@Param('id') id: string) {
    
    if (id) {
      return this.publicationsService.findOne(id);
    }
    return this.publicationsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/publication')
  @UseInterceptors(
    FilesInterceptor('file', undefined, multerConfig))
  async createPub(
  @GetUser() user: any,
    @Body() newUser: CreatePublicationsDto, 
    @UploadedFiles() file: Express.Multer.File[],
  ) {
    return this.publicationsService.createPub({ ...newUser, userId: user.id }, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/comment')
  async userComment(
  @GetUser() user: any,
    @Body() newComment: CreateCommentDto) {
    return this.publicationsService.comment({ ...newComment, userId: user.id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/comment/:idComment')
  async updateComment(
  @GetUser() user: any,
    @Param('idComment') idComment: string,
    @Body() body: CreateCommentDto,
  ) {
    return this.publicationsService.updateComment(user.id, idComment, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/comment/:idComment')
  async deleteComment(
  @GetUser() user: any,
    @Param('idComment') idComment: string,
  ) {
    return this.publicationsService.deleteComment(user.id, idComment);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async updateLikes(@Body() like: CreatePublicationsDto) {
    return this.publicationsService.updateLike(like);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update/:id') // actualizar publicacion (recibe un id y body)
  async updatePost(
  @GetUser() user: any,
    @Param('id') id: string,
    @Body() body: CreatePublicationsDto,
  ) {
    const publication: any = await this.publicationsService.findOne(id);

    if (user.id !== publication[0].userId) throw new HttpException('Forbidden resource', 403);

    return this.publicationsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteById(
  @GetUser() user: any,
    @Param('id') id: string,
  ) {
    const publication: any = await this.publicationsService.findOne(id);

    if (user.id !== publication[0].userId) throw new HttpException('Forbidden resource', 403);

    return this.publicationsService.delete(id);
  }
}
