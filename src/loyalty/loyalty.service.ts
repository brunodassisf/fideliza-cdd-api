import {
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
} from '@nestjs/common';
import { addHours, subHours, parseISO, parse } from 'date-fns';
import { UserService } from '../user/user.service';
import { PrismaService } from '../core/database/Prisma.service';
import { zonedTimeToUtc } from 'date-fns-tz';

interface IData {
    loyal: Date;
    admin_id: string;
}

interface ICreateLoaylty {
    userId: string;
    time_of_request: Date;
}

@Injectable()
export class LoyaltyService {
    constructor(
        private userService: UserService,
        private prisma: PrismaService,
    ) {}

    async request(userId: string) {
        const date = new Date();

        const dateNow = subHours(date, 3);

        try {
            await this.create({
                userId,
                time_of_request: dateNow,
            });

            await this.userService.findUserAndUpdateById(userId, {
                waiting_for_loyalty: true,
            });

            return {
                message:
                    'Fidelização enviada, agora e só aguardar para que seja marcado para você',
            };
        } catch (error) {
            throw new InternalServerErrorException({
                message:
                    'No momento não conseguimos fazer sua fidelização hoje, tente amanhã',
            });
        }
    }

    async confirm(adminId: string, id: string) {
        const findLoaylaty = await this.prisma.loyalty.findUnique({
            where: {
                id,
            },
            include: {
                User: true,
            },
        });

        const date = new Date();
        const dateAddHours = addHours(date, 20);
        const dateNextLoyalty = subHours(dateAddHours, 3);
        const dateNow = subHours(date, 3);

        if (dateNow < findLoaylaty.User.time_wait_next_loyalty) {
            throw new NotAcceptableException('Ainda não é possível fidelizar.');
        }

        const data = {
            loyal: dateNow,
            admin_id: adminId,
            nextTime: dateNextLoyalty,
        };

        try {
            await this.updatedLoyalty(id, data);

            return {
                message: 'Fidelidade realizada com sucesso com o cliente!',
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'No momento não conseguimos fazer sua fidelização hoje, tente novamente em breve.',
            );
        }
    }

    async add(newLoyalty: IData) {
        try {
            const loyal = await this.prisma.loyalty.create({
                data: {
                    loyal: newLoyalty.loyal,
                    admin_id: newLoyalty.admin_id,
                },
            });
            return loyal;
        } catch (error) {
            throw new InternalServerErrorException(
                'Não foi possível adicionar a fidelidade ao usuário.',
            );
        }
    }

    async updatedLoyalty(id: string, data: any) {
        await this.prisma.loyalty.update({
            where: {
                id,
            },
            data: {
                loyal: data.loyal,
                admin_id: data.admin_id,
                confirmed: true,
                User: {
                    update: {
                        time_wait_next_loyalty: data.nextTime,
                        waiting_for_loyalty: false,
                    },
                },
            },
        });
    }

    async create(newLoyalty: ICreateLoaylty) {
        try {
            const loyal = await this.prisma.loyalty.create({
                data: {
                    userId: newLoyalty.userId,
                    time_of_request: newLoyalty.time_of_request,
                },
            });
            return loyal;
        } catch (error) {
            throw new InternalServerErrorException(
                'Não foi possível adicionar a fidelidade ao usuário.',
            );
        }
    }

    async remove(id: string) {
        try {
            await this.prisma.loyalty.delete({
                where: { id: id },
            });
            return {
                message: 'Fidelidade do usuario removida.',
            };
        } catch (error) {
            throw new InternalServerErrorException({
                message: 'Não foi possível deletar a fidelidade do usuário.',
            });
        }
    }

    async usersWaitingConfirm() {
        const loyalties = await this.prisma.loyalty.findMany({
            where: {
                confirmed: false,
            },
            include: {
                User: true,
            },
        });
        return { data: loyalties };
    }

    async loyaltiesByUser(userId: string) {
        const users = await this.prisma.loyalty.findMany({
            where: {
                userId: userId,
                confirmed: true,
                completed_card: false,
            },
        });
        return { data: users };
    }
}
