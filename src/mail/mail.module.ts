import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/Prisma.service';
import { MailService } from './mail.service';

@Module({
    providers: [MailService, PrismaService, JwtService],
    exports: [MailService],
})
export class MailModule {}
