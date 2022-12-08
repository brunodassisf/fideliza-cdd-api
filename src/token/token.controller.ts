import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    @Post('refresh')
    async refreshToken(@Body() body) {
        const { refresh_token } = body;

        return this.tokenService.validaRefreshToken(refresh_token);
    }

    @Post('role')
    async validateRole(@Body() body) {
        const { refresh_token } = body;

        return this.tokenService.validateRoleByRfreshToken(refresh_token);
    }
}
