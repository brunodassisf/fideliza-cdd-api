import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { PrismaService } from '../core/database/Prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.NESTJS_JWT_SECRET_KEY,
        }),
    ],
    controllers: [TokenController],
    providers: [TokenService, PrismaService],
    exports: [TokenService],
})
export class TokenModule {}
