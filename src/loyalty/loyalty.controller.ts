import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import UserEntity from '../user/entities/user.entity';
import { LoyaltyService } from './loyalty.service';
import { Request } from 'express';

interface IDecodeJWT {
    userId: string;
    iat: number;
    exp: number;
}

@Controller('loyalty')
export class LoyaltyController {
    constructor(
        private readonly loyaltyService: LoyaltyService,
        private authService: AuthService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('request')
    async requestForLoaylty(@Req() req: Request) {
        const userId = (await this.handleJWT(req)) as string;
        return await this.loyaltyService.request(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('confirm_request')
    async confirmRequestLoayalty(@Req() req: Request) {
        const adminId = await this.handleJWT(req);
        const body = req.body;
        return this.loyaltyService.confirm(adminId, body.id);
    }

    @Get('waiting')
    async listUsersWaitingConfirm() {
        return await this.loyaltyService.usersWaitingConfirm();
    }

    @UseGuards(JwtAuthGuard)
    @Get('user')
    async listLoaltiesByUser(@Req() req: Request) {
        const userId = await this.handleJWT(req);
        return await this.loyaltyService.loyaltiesByUser(userId);
    }

    private async handleJWT(req: Request) {
        const jwt = req.headers.authorization.replace('Bearer ', '');
        const { userId } = (await this.authService.decodeToken(
            jwt,
        )) as IDecodeJWT;
        return userId;
    }
}
