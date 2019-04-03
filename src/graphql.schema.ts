
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export class AuthPayload {
    token: string;
    user: User;
}

export class Comment {
    id: string;
    body: string;
    user: User;
    ride: Ride;
    createdAt: Date;
}

export abstract class IMutation {
    abstract saveComment(rideId: number, body: string): Comment | Promise<Comment>;

    abstract deleteComment(id: number): boolean | Promise<boolean>;

    abstract requestParticipation(rideId: number): boolean | Promise<boolean>;

    abstract acceptParticipant(id: number): boolean | Promise<boolean>;

    abstract rejectParticipant(id: number): boolean | Promise<boolean>;

    abstract saveRide(trailId: string, date: Date, time: Date, id?: number): Ride | Promise<Ride>;

    abstract deleteRide(id?: number): boolean | Promise<boolean>;

    abstract signup(email: string, password: string, name: string): AuthPayload | Promise<AuthPayload>;

    abstract login(email: string, password: string): AuthPayload | Promise<AuthPayload>;
}

export class Participation {
    id: string;
    ride: Ride;
    user: User;
    status: string;
}

export abstract class IQuery {
    abstract comments(rideId: number): Comment[] | Promise<Comment[]>;

    abstract participations(): Participation[] | Promise<Participation[]>;

    abstract rides(page: number): Ride[] | Promise<Ride[]>;

    abstract ride(id: number): Ride | Promise<Ride>;

    abstract myRides(): Ride[] | Promise<Ride[]>;

    abstract myParticipatingRides(): Ride[] | Promise<Ride[]>;

    abstract users(): User[] | Promise<User[]>;

    abstract trails(location: string): Trail[] | Promise<Trail[]>;

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

export abstract class ISubscription {
    abstract commentAdded(rideId: number): Comment | Promise<Comment>;
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
