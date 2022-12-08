import {
    Injectable,
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    PreconditionFailedException,
    InternalServerErrorException,
} from '@nestjs/common';
import { generatorHash, isMatch } from '../core/util/bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import UserEntity from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';

interface IPayload {
    payload: UserEntity;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private tokenService: TokenService,
        private mailService: MailService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new NotFoundException('Usuário ou senha inválidos.');
        if (user.status === 'I')
            throw new UnauthorizedException(
                'Você não validou sua conta, favor acessar seu email ou entrar em contato conosco.',
            );

        const getHash = await isMatch(password, user.hash);
        if (user && getHash) {
            const { hash, id, role, ...result } = user;
            return { id, hash, role };
        }
        return null;
    }

    async login(user: any) {
        try {
            const { id: userId, role, hash } = user;

            const refresh_token = await this.tokenService.generateRefreshToke({
                userId,
                hash,
            });

            const access_token = await this.tokenService.signNewAccessToken(
                userId,
            );

            return {
                access_token,
                refresh_token,
                role,
            };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(
                'Não foi possível realizar seu login no momento',
            );
        }
    }

    async decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    async checkTokenAndValidUser(token: string) {
        const userToken = await this.decodeToken(token);

        if (!userToken)
            throw new BadRequestException('Token de acesso inválido');

        const {
            payload: { email },
        } = userToken as IPayload;

        const findUser = await this.userService.findUserByEmail(email);
        if (!findUser)
            throw new NotFoundException('Usuário não existena base de dados.');
        if (findUser.status === 'A')
            throw new PreconditionFailedException(
                'Sua conta ja foi confirmada, você pode fazer seu login apartir de agora.',
            );
        const { id, ...userUpdate } = findUser;
        const updatedStatusUser = await this.userService.findUserAndUpdateById(
            id,
            {
                ...userUpdate,
                status: 'A',
            },
        );
        return {
            message: 'Bem-vindo ao Fideliza CDD!',
            operations: 'account validate success',
            data: updatedStatusUser,
        };
    }

    async requestResetPassword(email: string, origin: string) {
        const user = await this.userService.findUserByEmail(email);
        if (!user) throw new NotFoundException('E-mail inválido.');

        try {
            if (origin === process.env.BASE_URL_APP_PROD) {
                await this.mailService.reset(email, origin);
            }

            return {
                message:
                    'Um e-mail com instruções foi enviado para recuperar sua senha!',
                operation: 'request reset password success',
            };
        } catch (error) {
            throw new InternalServerErrorException(
                'Houve um erro durante a solicitação para recuperar sua senha, favor tentar novamente em breve.',
            );
        }
    }

    async requestRecoverPassword(token: string) {
        const hasToken = await this.decodeToken(token);

        if (!hasToken) throw new BadRequestException('Solicitão expirada.');

        return {
            message:
                'Quase lá, preencha uma nova senha para acessar sua conta!',
            operation: 'request recover password success',
            authorized: true,
        };
    }
}
