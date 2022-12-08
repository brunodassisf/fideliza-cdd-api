import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendGrid from '@sendgrid/mail';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}
    async register(newUser: any, origin: string) {
        const generatorTokenAccess = this.jwtService.sign(
            { payload: newUser },
            {
                secret: process.env.NESTJS_JWT_SECRET_KEY,
                expiresIn: '99y',
            },
        );

        sendGrid.setApiKey(this.configService.get<string>('sendgrid.api_key'));

        const msg = {
            to: newUser.email,
            from: 'Fideliza CDD <system@assisdevelopment.com.br>',
            templateId: 'd-f86d62e093e94f2ab83b4fcc3e8d9efd',
            dynamic_template_data: {
                subject: 'Acessar conta',
                name: newUser.name,
                url: `${origin}/confirm/account/${generatorTokenAccess}`,
            },
        };

        sendGrid.send(msg);
    }

    async reset(email: string, origin: string) {
        const generatorTokenAccess = this.jwtService.sign(
            { payload: email },
            {
                secret: process.env.NESTJS_JWT_SECRET_KEY,
                expiresIn: '2h',
            },
        );

        sendGrid.setApiKey(this.configService.get<string>('sendgrid.api_key'));

        const msg = {
            to: email,
            from: 'Fideliza CDD <system@assisdevelopment.com.br>',
            templateId: 'd-c156b274d33b42498656480540d5a174',
            dynamic_template_data: {
                subject: 'Recuperar senha',
                url: `${origin}/recover-password/${generatorTokenAccess}`,
            },
        };

        sendGrid.send(msg);
    }
}
