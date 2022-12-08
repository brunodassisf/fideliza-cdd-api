export enum Type {
    ADMIN = 'ADMIN',
    USER = 'USER',
}

export default class UserEntity {
    id: string;
    name: string;
    email: string;
    password?: string;
    hash?: string;
    status: string;
    avatar: string;
    birthday: Date;
    rescue_count: number;
    type: Type;
    waiting_for_loyalty: boolean;
    time_wait_next_loyalty: string;
}
