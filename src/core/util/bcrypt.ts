import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

export async function generatorHash(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
}

export async function isMatch(
    password: string,
    hash: string,
): Promise<boolean> {
    const compare = await bcrypt.compare(password, hash);
    return compare;
}
