import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../core/database/Prisma.service';

@Module({
    imports: [UserModule, AuthModule],
    controllers: [LoyaltyController],
    providers: [LoyaltyService, PrismaService],
})
export class LoyaltyModule {}
