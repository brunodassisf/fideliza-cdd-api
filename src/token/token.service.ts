import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { generatorHash, isMatch } from '../core/util/bcrypt';
import { UserService } from '../user/user.service';

interface IRefreshToken {
    hash: string;
    userId: string;
    role: string;
    iat: number;
    exp: number;
}

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService,
    ) {}

    async validaRefreshToken(token: string) {
        const { userId, hash, role } = await this.verifyRefreshToken(token);

        const hashTokenRefresh = await generatorHash(hash);

        const refresh_token = await this.generateRefreshToke({
            userId,
            hash: hashTokenRefresh,
        });

        const access_token = await this.signNewAccessToken(userId);

        return {
            access_token,
            refresh_token,
            role,
        };
    }

    async validateRoleByRfreshToken(token: string) {
        const { userId, role } = await this.verifyRefreshToken(token);

        const access_token = await this.signNewAccessToken(userId);

        return {
            access_token,
            role,
        };
    }

    async decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    async verifyRefreshToken(token: string): Promise<Partial<IRefreshToken>> {
        return this.jwtService
            .verifyAsync(token)
            .then(async (res) => {
                const { userId, hash } = res;
                const findUser = await this.userService.findUserById(userId);

                if (findUser.refresh_token !== hash) {
                    throw new UnauthorizedException('Token inválido');
                }

                return {
                    userId: findUser.id,
                    hash: findUser.refresh_token,
                    role: findUser.role,
                };
            })
            .catch(() => {
                throw new UnauthorizedException(
                    'Sessão inspirada. Favor logar novamente',
                );
            });
    }

    async verifyAccessToken(token: string) {
        return this.jwtService
            .verifyAsync(token)
            .then(async (res) => {
                const { userId } = res;
                const findUser = await this.userService.findUserById(userId);

                const { hash, refresh_token, ...user } = findUser;

                return { data: user };
            })
            .catch(() => {
                throw new UnauthorizedException(
                    'Sessão inspirada. Favor logar novamente',
                );
            });
    }

    async signNewAccessToken(id: string): Promise<string> {
        const newAccessToken = await this.jwtService.signAsync(
            { userId: id },
            {
                expiresIn: process.env.TIME_TOKEN_ACCESS_TOKEN,
            },
        );
        return newAccessToken;
    }

    async generateRefreshToke(
        data: Omit<IRefreshToken, 'iat' | 'exp' | 'role'>,
    ): Promise<string> {
        const { hash, userId } = data;
        const hashRefreshToken = await generatorHash(hash);

        const findUser = await this.userService.findUserAndUpdateById(userId, {
            refresh_token: hashRefreshToken,
        });

        const refresh_token = this.jwtService.sign(
            { userId, hash: hashRefreshToken, role: findUser.role },
            { expiresIn: process.env.TIME_TOKEN_REFRESH_TOKEN },
        );

        return refresh_token;
    }
}
