import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { TokenModule } from './token/token.module';
import config from './core/util/configEnv';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
        }),
        UserModule,
        AuthModule,
        MailModule,
        LoyaltyModule,
        TokenModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
