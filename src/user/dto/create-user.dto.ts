import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty({ message: 'Nome é obrigatório' })
    name: string;

    @IsEmail({}, { message: 'E-mail inválido' })
    @IsNotEmpty({ message: 'E-mail é obrigatório' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Senha é obrigatório' })
    password: string;

    @IsOptional()
    avatar: string;

    @IsOptional()
    birthday: string;
}
