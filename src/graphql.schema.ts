export class AuthPayload {
    token: string;
    user: User;
}

export abstract class IMutation {
    abstract saveRide(id?: string, trailId: string, date: Date, time: Date): Ride | Promise<Ride>;

    abstract signup(email: string, password: string, name: string): AuthPayload | Promise<AuthPayload>;

    abstract login(email: string, password: string): AuthPayload | Promise<AuthPayload>;
}

export abstract class IQuery {
    abstract rides(): Ride[] | Promise<Ride[]>;

    abstract ride(id: number): Ride | Promise<Ride>;

    abstract trails(location: string): Trail[] | Promise<Trail[]>;

    abstract users(): User[] | Promise<User[]>;

    abstract temp__(): boolean | Promise<boolean>;
}

export class Ride {
    id: number;
    trailId: string;
    location: string;
    date: Date;
    time: Date;
    user: User;
    trail: Trail;
    createdAt: Date;
    updatedAt: Date;
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

export type Date = any;
