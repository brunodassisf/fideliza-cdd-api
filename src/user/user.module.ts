import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/database/Prisma.service';
import { MailModule } from '../mail/mail.module';
import UserEntity from './entities/user.entity';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [UserEntity, MailModule],
    controllers: [UserController],
    providers: [PrismaService, UserService, JwtService],
    exports: [UserService, UserEntity],
})
export class UserModule {}
