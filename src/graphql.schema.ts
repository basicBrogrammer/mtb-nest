export class AuthPayload {
    token: string;
    user: User;
}

export abstract class IMutation {
    abstract signup(email: string, password: string, name: string): AuthPayload | Promise<AuthPayload>;

    abstract login(email: string, password: string): AuthPayload | Promise<AuthPayload>;
}

export abstract class IQuery {
    abstract users(): User[] | Promise<User[]>;

    abstract temp__(): boolean | Promise<boolean>;
}

export class User {
    id: string;
    email: string;
    name: string;
}
