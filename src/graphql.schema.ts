export class AuthPayload {
    token: string;
    user: User;
}

export abstract class IMutation {
    abstract signup(email: string, password: string, name: string): AuthPayload | Promise<AuthPayload>;

    abstract login(email: string, password: string): AuthPayload | Promise<AuthPayload>;
}

export abstract class IQuery {
    abstract trails(location: string): Trail[] | Promise<Trail[]>;

    abstract users(): User[] | Promise<User[]>;

    abstract temp__(): boolean | Promise<boolean>;
}

export class Trail {
    id: string;
    name: string;
    summary: string;
    difficulty: string;
    stars: number;
    location: string;
    url: string;
    imgSqSmall: string;
    imgSmall: string;
    imgSmallMed: string;
    imgMedium: string;
    length: number;
    ascent: number;
    high: number;
    low: string;
    latitude: number;
    longitude: number;
}

export class User {
    id: string;
    email: string;
    name: string;
}
