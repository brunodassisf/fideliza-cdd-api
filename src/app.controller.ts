import {
    Controller,
    Req,
    Post,
    UseGuards,
    Get,
    Param,
    Headers,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Request } from 'express';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UserService } from './user/user.service';
import { TokenService } from './token/token.service';

interface IDecodeJWT {
    userId: string;
    iat: number;
    exp: number;
}

@Controller()
export class AppController {
    constructor(
        private authService: AuthService,
        private userService: UserService,
        private tokenService: TokenService,
    ) {}

    @UseGuards(LocalAuthGuard)
    @Post('auth/login')
    async login(@Req() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('auth/session')
    async session(@Req() req: Request) {
        const jwt = req.headers.authorization.replace('Bearer ', '');
        const data = await this.tokenService.verifyAccessToken(jwt);
        return data;
    }

    @Get('confirm/account/:token')
    checkValidAccount(@Param() Param) {
        return this.authService.checkTokenAndValidUser(Param.token);
    }

    @Get('/reset-password/:email')
    requestResetPassword(@Headers() header, @Param() Param) {
        const originRequest = header.origin;
        return this.authService.requestResetPassword(
            Param.email,
            originRequest,
        );
    }

    @Get('recover-password/:token')
    requestRecoverPassword(@Param() Param) {
        return this.authService.requestRecoverPassword(Param.token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('auth/password')
    async requestNewPassword(@Req() req: Request) {
        const jwt = req.headers.authorization.replace('Bearer ', '');
        const data: any = await this.authService.decodeToken(jwt);
        const { password } = req.body;
        return this.userService.newPassword(data.payload, password);
    }
}
