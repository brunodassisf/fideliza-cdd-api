import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../mail/mail.module';
import { TokenModule } from '../token/token.module';

@Module({
    imports: [
        UserModule,
        MailModule,
        PassportModule,
        TokenModule,
        JwtModule.register({
            secret: process.env.NESTJS_JWT_SECRET_KEY,
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
