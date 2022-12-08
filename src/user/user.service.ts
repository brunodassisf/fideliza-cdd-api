import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../core/database/Prisma.service';
import { generatorHash } from '../core/util/bcrypt';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private readonly mail: MailService,
    ) {}
    async create(
        createUserDto: CreateUserDto,
        origin: string,
        adminAccount: boolean,
    ) {
        const hash = await generatorHash(createUserDto.password);
        const existUser = await this.prisma.user.findUnique({
            where: {
                email: createUserDto.email,
            },
        });

        if (existUser) {
            throw new ConflictException(
                'Já existe um usuário com esse e-mail.',
            );
        }

        const newUser = await this.prisma.user.create({
            data: {
                name: createUserDto.name,
                email: createUserDto.email,
                hash: hash,
                status: origin !== process.env.BASE_URL_APP_PROD ? 'A' : 'I',
                role: adminAccount ? 'ADMIN' : 'USER',
            },
        });

        try {
            if (origin === process.env.BASE_URL_APP_PROD) {
                await this.mail.register(newUser, origin);
            }

            return {
                message:
                    'Conta criada com sucesso! Acesse seu e-mail e confime sua conta para começar a fidelizar.',
                operation: 'email for confirm account sended success',
            };
        } catch (error) {
            throw new BadRequestException(
                'Não foi possível criar sua conta nomento, aguarde alguns instantes para tentar novamente.',
            );
        }
    }

    async findUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) throw new NotFoundException('Usuário não encontrado');
        return user;
    }

    async findUserById(id: any) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            },
            include: {
                loyalty: true,
            },
        });
        if (!user) throw new NotFoundException('Usuário não encontrado.');
        return user;
    }

    async findUserAndUpdateById(id: string, data: any) {
        const userUpdate = await this.prisma.user.update({
            where: {
                id: id,
            },
            data: data,
        });
        if (!userUpdate)
            throw new NotFoundException(
                'Não foi possível atualizar dados do usuário',
            );
        return userUpdate;
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            include: {
                loyalty: true,
            },
        });
        return users;
    }

    async findAllUsers() {
        const users = await this.prisma.user.findMany({
            include: {
                loyalty: true,
            },
            where: {
                role: 'USER',
            },
        });
        return users;
    }

    async newPassword(email: string, password: string) {
        try {
            const hash = await generatorHash(password);
            await this.prisma.user.update({
                where: {
                    email: email,
                },
                data: {
                    hash: hash,
                },
            });
            return {
                message:
                    'Senha redefinida com sucesso! Você ja pode acessar sua conta :)',
                operation: 'set new password success',
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Ocorreu um erro durante a troca da sua senha, favor tentar novamente mais tarde ou entrar em contato conosco.',
            );
        }
    }
}
