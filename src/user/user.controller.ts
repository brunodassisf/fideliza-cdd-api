import { Controller, Post, Body, Headers, Get, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

interface IQueryCreateUser {
    type: string;
    key: string;
}

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(
        @Headers() header,
        @Query() query: IQueryCreateUser,
        @Body() createUserDto: CreateUserDto,
    ) {
        const originRequest = header.origin;
        const { key, type } = query;
        const adminAccount = type === 'ADMIN' && key === process.env.MASTER_KEY;
        return this.userService.create(
            createUserDto,
            originRequest,
            adminAccount,
        );
    }

    @Post('byEmail')
    async findUserByEmail(@Body() data: any) {
        return this.userService.findUserByEmail(data.email);
    }

    @Get('all')
    async findAll() {
        return this.userService.findAll();
    }

    @Get('users')
    async findAllUser() {
        return this.userService.findAllUsers();
    }
}
